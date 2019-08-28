import { Base } from "../class/Mixin.js"
import { lazyBuild } from "../util/Helper.js"
import { Field, Name } from "./Field.js"
import { Schema } from "./Schema.js"

export const IteratorReturnedEarly  = Symbol("IteratorReturnedEarly")
export type IteratorResult          = typeof IteratorReturnedEarly | void

//---------------------------------------------------------------------------------------------------------------------
export class Entity extends Base {
    name                : Name

    fields              : Map<Name, Field>      = new Map()

    schema              : Schema

    parentEntity        : Entity


    hasField (name : Name) : boolean {
        return this.getField(name) !== undefined
    }


    getField (name : Name) : Field {
        return this.allFields.get(name)
    }


    addField <T extends Field> (field : T) : T {
        const name      = field.name
        if (!name) throw new Error(`Field must have a name`)

        if (this.fields.has(name)) throw new Error(`Field with name [${name}] already exists`)

        field.entity    = this

        this.fields.set(name, field)

        return field
    }


    forEachParent (func : (Entity) => IteratorResult) : IteratorResult {
        let entity : Entity         = this

        while (entity) {
            if (func(entity) === IteratorReturnedEarly) return IteratorReturnedEarly

            entity                  = entity.parentEntity
        }
    }


    get allFields () : Map<Name, Field> {
        const allFields             = new Map()
        const visited : Set<Name>   = new Set()

        this.forEachParent(entity => {
            entity.ownFields.forEach((field : Field, name : Name) => {
                if (!visited.has(name)) {
                    visited.add(name)

                    allFields.set(name, field)
                }
            })
        })

        return lazyBuild(this, 'allFields', allFields)
    }


    forEachField (func : (field : Field, name : Name) => any) {
        this.allFields.forEach(func)
    }
}
