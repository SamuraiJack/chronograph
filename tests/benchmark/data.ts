import { computed, observable } from "../../node_modules/mobx/lib/mobx.module.js"
import { ChronoGraph, MinimalChronoGraph } from "../../src/chrono/Graph.js"
import { CalculatedValueGen, CalculatedValueSync, Identifier } from "../../src/chrono/Identifier.js"
import { AnyConstructor, Base } from "../../src/class/Mixin.js"
import { Entity, field } from "../../src/replica/Entity.js"
import { MinimalReplica, Replica } from "../../src/replica/Replica.js"

//---------------------------------------------------------------------------------------------------------------------
export type GraphGenerationResult  = { graph : ChronoGraph, boxes : Identifier[], counter : number }


//---------------------------------------------------------------------------------------------------------------------
export const deepGraphGen = (atomNum : number = 1000) : GraphGenerationResult => {
    const graph : ChronoGraph   = MinimalChronoGraph.new()

    let boxes       = []

    const res       = { graph, boxes, counter : 0 }

    for (let i = 0; i < atomNum; i++) {
        if (i <= 3) {
            boxes.push(graph.variableId(i, 1))
        }
        else if (i <= 10) {
            boxes.push(graph.identifierId(i, function* (YIELD) {
                res.counter++

                const input : number[] = [
                    yield boxes[0],
                    yield boxes[1],
                    yield boxes[2],
                    yield boxes[3]
                ]

                return input.reduce((sum, op) => sum + op, 0)
            }, i))
        }
        else if (i % 2 == 0) {
            boxes.push(graph.identifierId(i, function* (YIELD) {
                res.counter++

                const input : number[] = [
                    yield boxes[this - 1],
                    yield boxes[this - 2],
                    yield boxes[this - 3],
                    yield boxes[this - 4]
                ]

                return input.reduce((sum, op) => (sum + op) % 10000, 0)
            }, i))
        } else {
            boxes.push(graph.identifierId(i, function* (YIELD) {
                res.counter++

                const input : number[] = [
                    yield boxes[this - 1],
                    yield boxes[this - 2],
                    yield boxes[this - 3],
                    yield boxes[this - 4]
                ]

                return input.reduce((sum, op) => (sum - op) % 10000, 0)
            }, i))
        }
    }

    return res
}


//---------------------------------------------------------------------------------------------------------------------
export const deepGraphGenShared = (atomNum : number = 1000) : GraphGenerationResult => {
    const graph : ChronoGraph   = MinimalChronoGraph.new()

    let boxes       = []

    const res       = { graph, boxes, counter : 0 }

    class MyIden1 extends CalculatedValueGen {
        * calculation (YIELD) {
            res.counter++

            const input : number[] = [
                yield boxes[0],
                yield boxes[1],
                yield boxes[2],
                yield boxes[3]
            ]

            return input.reduce((sum, op) => sum + op, 0)
        }
    }

    class MyIden2 extends CalculatedValueGen {
        * calculation (this : number, YIELD) {
            res.counter++

            const input : number[] = [
                yield boxes[this - 1],
                yield boxes[this - 2],
                yield boxes[this - 3],
                yield boxes[this - 4]
            ]

            return input.reduce((sum, op) => (sum + op) % 10000, 0)
        }
    }

    class MyIden3 extends CalculatedValueGen {
        * calculation (this : number, YIELD) {
            res.counter++

            const input : number[] = [
                yield boxes[this - 1],
                yield boxes[this - 2],
                yield boxes[this - 3],
                yield boxes[this - 4]
            ]

            return input.reduce((sum, op) => (sum - op) % 10000, 0)
        }
    }


    for (let i = 0; i < atomNum; i++) {
        if (i <= 3) {
            boxes.push(graph.variableId(i, 1))
        }
        else if (i <= 10) {
            const iden1 = MyIden1.new({ name : i, context : i })

            graph.addIdentifier(iden1)

            boxes.push(iden1)
        }
        else if (i % 2 == 0) {
            const iden2 = MyIden2.new({ name : i, context : i })

            graph.addIdentifier(iden2)

            boxes.push(iden2)
        } else {
            const iden3 = MyIden3.new({ name : i, context : i })

            graph.addIdentifier(iden3)

            boxes.push(iden3)
        }
    }

    return res
}


//---------------------------------------------------------------------------------------------------------------------
export const deepGraphSync = (atomNum : number = 1000) : GraphGenerationResult => {
    const graph : ChronoGraph   = MinimalChronoGraph.new()

    let boxes       = []

    const res       = { graph, boxes, counter : 0 }

    for (let i = 0; i < atomNum; i++) {
        if (i <= 3) {
            boxes.push(graph.variableId(i, 1))
        }
        else if (i <= 10) {
            boxes.push(graph.addIdentifier(CalculatedValueSync.new({
                calculation : function (YIELD) {
                    res.counter++

                    const input : number[] = [
                        YIELD(boxes[0]),
                        YIELD(boxes[1]),
                        YIELD(boxes[2]),
                        YIELD(boxes[3])
                    ]

                    return input.reduce((sum, op) => sum + op, 0)
                },
                context : i
            })))
        }
        else if (i % 2 == 0) {
            boxes.push(graph.addIdentifier(CalculatedValueSync.new({
                calculation : function (YIELD) {
                    res.counter++

                    const input : number[] = [
                        YIELD(boxes[this - 1]),
                        YIELD(boxes[this - 2]),
                        YIELD(boxes[this - 3]),
                        YIELD(boxes[this - 4])
                    ]

                    return input.reduce((sum, op) => (sum + op) % 10000, 0)
                },
                context : i
            })))
        } else {
            boxes.push(graph.addIdentifier(CalculatedValueSync.new({
                calculation : function (YIELD) {
                    res.counter++

                    const input : number[] = [
                        YIELD(boxes[this - 1]),
                        YIELD(boxes[this - 2]),
                        YIELD(boxes[this - 3]),
                        YIELD(boxes[this - 4])
                    ]

                    return input.reduce((sum, op) => (sum - op) % 10000, 0)
                },
                context : i
            })))
        }
    }

    return res
}


//---------------------------------------------------------------------------------------------------------------------
export type MobxBox = { get : () => number, set : (v : number) => any }

export type MobxGraphGenerationResult  = { boxes : MobxBox[], counter : number }

export const mobxGraph = (atomNum : number = 1000) : MobxGraphGenerationResult => {
    let boxes       = []

    const res       = { boxes, counter : 0 }

    for (let i = 0; i < atomNum; i++) {
        if (i <= 3) {
            boxes.push(observable.box(1))
        }
        else if (i <= 10) {
            boxes.push(computed(function () {
                res.counter++

                const input = [
                    boxes[0].get(),
                    boxes[1].get(),
                    boxes[2].get(),
                    boxes[3].get(),
                ]

                return input.reduce((sum, op) => sum + op, 0)
            }, { keepAlive : true, context : i }))
        }
        else if (i % 2 == 0) {
            boxes.push(computed(function () {
                res.counter++

                const input = [
                    boxes[this - 1].get(),
                    boxes[this - 2].get(),
                    boxes[this - 3].get(),
                    boxes[this - 4].get(),
                ]

                return input.reduce((sum, op) => (sum + op) % 10000, 0)
            }, { keepAlive : true, context : i }))

        } else {
            boxes.push(computed(function () {
                res.counter++

                const input = [
                    boxes[this - 1].get(),
                    boxes[this - 2].get(),
                    boxes[this - 3].get(),
                    boxes[this - 4].get(),
                ]

                return input.reduce((sum, op) => (sum - op) % 10000, 0)
            }, { keepAlive : true, context : i }))
        }
    }

    return res
}


//---------------------------------------------------------------------------------------------------------------------
export type ReplicaGenerationResult  = { replica : Replica, entities : Entity[] }


//---------------------------------------------------------------------------------------------------------------------
export const Mixin1 = <T extends AnyConstructor<Entity>>(base : T) => {

    class Mixin1 extends base {
        @field()
        field11         : string        = 'string'

        @field()
        field12         : number        = 0

        @field()
        field13         : boolean       = false

        @field()
        field14         : any[]         = []

        @field()
        field15         : object        = {}
    }

    return Mixin1
}

//---------------------------------------------------------------------------------------------------------------------
export const Mixin2 = <T extends AnyConstructor<Entity>>(base : T) => {

    class Mixin2 extends base {
        @field()
        field21         : string        = 'string'

        @field()
        field22         : number        = 0

        @field()
        field23         : boolean       = false

        @field()
        field24         : any[]         = []

        @field()
        field25         : object        = {}
    }

    return Mixin2
}

//---------------------------------------------------------------------------------------------------------------------
export const Mixin3 = <T extends AnyConstructor<Entity>>(base : T) => {

    class Mixin3 extends base {
        @field()
        field31         : string        = 'string'

        @field()
        field32         : number        = 0

        @field()
        field33         : boolean       = false

        @field()
        field34         : any[]         = []

        @field()
        field35         : object        = {}
    }

    return Mixin3
}


//---------------------------------------------------------------------------------------------------------------------
export const Mixin4 = <T extends AnyConstructor<Entity>>(base : T) => {

    class Mixin4 extends base {
        @field()
        field41         : string        = 'string'

        @field()
        field42         : number        = 0

        @field()
        field43         : boolean       = false

        @field()
        field44         : any[]         = []

        @field()
        field45         : object        = {}
    }

    return Mixin4
}

//---------------------------------------------------------------------------------------------------------------------
export const Mixin5 = <T extends AnyConstructor<Entity>>(base : T) => {

    class Mixin5 extends base {
        @field()
        field51         : string        = 'string'

        @field()
        field52         : number        = 0

        @field()
        field53         : boolean       = false

        @field()
        field54         : any[]         = []

        @field()
        field55         : object        = {}
    }

    return Mixin5
}

class TestEntity5 extends Mixin5(Mixin4(Mixin3(Mixin2(Mixin1(Entity(Base)))))) {}

class TestEntity1 extends Mixin1(Entity(Base)) {}

//---------------------------------------------------------------------------------------------------------------------
export const replicaGen = (entitiesNum : number = 1000) : ReplicaGenerationResult => {
    const replica : Replica     = MinimalReplica.new()

    let entities       = []

    const res       = { replica, entities }

    for (let i = 0; i < entitiesNum; i++) {
        // entities.push(TestEntity5.new())
        replica.addEntity(TestEntity5.new())
    }

    return res
}
