import { AnyConstructor, Base, Mixin } from "../class/Mixin.js"
import { VisitInfo } from "../graph/WalkDepth.js"
import { CalculationContext, CalculationGen, CalculationSync, GenericCalculation } from "../primitives/Calculation.js"
import { Identifier } from "./Identifier.js"
import { QuarkEntry } from "./Revision.js"


//---------------------------------------------------------------------------------------------------------------------
export const QuarkTransition = <T extends AnyConstructor<Base & GenericCalculation<any, any, [ CalculationContext<any> ]>>>(base : T) => {

    class QuarkTransition extends base implements VisitInfo {
        identifier      : Identifier

        previous        : QuarkEntry
        // current         : QuarkEntry

        edgesFlow       : number

        visitedAt               : number
        visitedTopologically    : boolean


        get calculation () : this[ 'identifier' ][ 'calculation' ] {
            return this.identifier.calculation
        }


        get context () : this[ 'identifier' ][ 'context' ] {
            return this.identifier.context
        }
    }

    return QuarkTransition
}

export type QuarkTransition = Mixin<typeof QuarkTransition>


//---------------------------------------------------------------------------------------------------------------------
export class QuarkTransitionGen extends QuarkTransition(CalculationGen(Base)) {}

//---------------------------------------------------------------------------------------------------------------------
export class QuarkTransitionSync extends QuarkTransition(CalculationSync(Base)) {}
