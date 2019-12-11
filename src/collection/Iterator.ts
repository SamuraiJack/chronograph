//---------------------------------------------------------------------------------------------------------------------
export function* inBatchesBySize<Element> (iterator : Iterable<Element>, batchSize : number) : Iterable<Element[]> {
    if (batchSize < 0) throw new Error("Batch size needs to a natural number")
    batchSize   = batchSize | 0

    const runningBatch : Element[]  = []

    for (const el of iterator) {
        if (runningBatch.length === batchSize) {
            yield runningBatch

            runningBatch.length = 0
        }

        runningBatch.push(el)
    }

    if (runningBatch.length > 0) yield runningBatch
}


//---------------------------------------------------------------------------------------------------------------------
export function* filter<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : Iterable<Element> {
    let i   = 0

    for (const el of iterator) {
        if (func(el, i++)) yield el
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function every<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : boolean {
    let i   = 0

    for (const el of iterator) {
        if (!func(el, i++)) return false
    }

    return true
}


//---------------------------------------------------------------------------------------------------------------------
export function some<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : boolean {
    let i   = 0

    for (const el of iterator) {
        if (func(el, i++)) return true
    }

    return false
}


//---------------------------------------------------------------------------------------------------------------------
export function* map<Element, Result> (iterator : Iterable<Element>, func : (el : Element, index : number) => Result) : Iterable<Result> {
    let i   = 0

    for (const el of iterator) yield func(el, i++)
}


//---------------------------------------------------------------------------------------------------------------------
export function reduce<Element, Result> (iterator : Iterable<Element>, func : (acc : Result, el : Element, index : number) => Result, initialAcc : Result) : Result {
    let i   = 0

    let acc : Result        = initialAcc

    for (const el of iterator) {
        acc                 = func(acc, el, i)
    }

    return acc
}


//---------------------------------------------------------------------------------------------------------------------
export function* uniqueOnly<Element> (iterator : Iterable<Element>) : Iterable<Element> {
    const seen      = new Set<Element>()

    for (const el of iterator) {
        if (!seen.has(el)) {
            seen.add(el)

            yield el
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function* uniqueOnlyBy<Element, UniqueBy> (iterator : Iterable<Element>, func : (el : Element) => UniqueBy) : Iterable<Element> {
    const seen      = new Set<UniqueBy>()

    for (const el of iterator) {
        const uniqueBy  = func(el)

        if (!seen.has(uniqueBy)) {
            seen.add(uniqueBy)

            yield el
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function* reverse<Element> (iterator : Iterable<Element>) : Iterable<Element> {
    const all       = Array.from(iterator)

    for (let i = all.length - 1; i >= 0; i--) yield all[ i ]
}


//---------------------------------------------------------------------------------------------------------------------
export function* takeWhile<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : Iterable<Element> {
    let i   = 0

    for (const el of iterator) {
        if (func(el, i++))
            yield el
        else
            return
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function* takeUntilIncluding<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : Iterable<Element> {
    let i   = 0

    for (const el of iterator) {
        yield el

        if (func(el, i++)) return
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function* takeUntilExcluding<Element> (iterator : Iterable<Element>, func : (el : Element, index : number) => boolean) : Iterable<Element> {
    let i   = 0

    for (const el of iterator) {
        if (func(el, i++)) return

        yield el
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function* concat<Element> (...iterators : Iterable<Element>[]) : Iterable<Element> {
    for (let i = 0; i < iterators.length; i++) yield* iterators[ i ]
}


//---------------------------------------------------------------------------------------------------------------------
export function* concatIterable<Element> (iteratorsProducer : Iterable<Iterable<Element>>) : Iterable<Element> {
    for (const iterator of iteratorsProducer) yield* iterator
}


//---------------------------------------------------------------------------------------------------------------------
// just a chained syntax sugar class
export class ChainedIteratorClass<T> {
    iterator        : Iterable<T>


    constructor (iterator : Iterable<T>) {
        this.iterator       = iterator
    }


    inBatchesBySize (batchSize : number) : ChainedIteratorClass<T[]> {
        return new ChainedIteratorClass(inBatchesBySize(this.iterator, batchSize))
    }


    filter (func : (el : T, index : number) => boolean) : ChainedIteratorClass<T> {
        return new ChainedIteratorClass(filter(this.iterator, func))
    }


    map<Result> (func : (el : T, index : number) => Result) : ChainedIteratorClass<Result> {
        return new ChainedIteratorClass(map(this.iterator, func))
    }


    reduce<Result> (func : (acc : Result, el : T, index : number) => Result, initialAcc : Result) : Result {
        return reduce(this.iterator, func, initialAcc)
    }


    concat<K> () : T extends Iterable<K> ? ChainedIteratorClass<K> : never {
        return new ChainedIteratorClass(concatIterable<K>(this.iterator as any)) as any
    }


    uniqueOnly () : ChainedIteratorClass<T> {
        return new ChainedIteratorClass(uniqueOnly(this.iterator))
    }


    uniqueOnlyBy<UniqueBy> (func : (el : T) => UniqueBy) : ChainedIteratorClass<T> {
        return new ChainedIteratorClass(uniqueOnlyBy(this.iterator, func))
    }


    every (func : (el : T, index : number) => boolean) : boolean {
        return every(this.iterator, func)
    }


    some (func : (el : T, index : number) => boolean) : boolean {
        return some(this.iterator, func)
    }


    takeWhile (func : (el : T, index : number) => boolean) : ChainedIteratorClass<T> {
        return new ChainedIteratorClass(takeWhile(this.iterator, func))
    }


    * [Symbol.iterator] () {
        yield* this.iterator
    }


    toArray () : T[] {
        return Array.from(this)
    }


    toSet () : Set<T> {
        return new Set(this)
    }


    // toMap () : T extends [ infer K, infer V ] ? Map<K, V> : never  {
    //     return new Map(this as (T extends [ infer K, infer V ] ? Iterable<[ K, V ]> : never))
    // }


    flush () {
        for (const element of this) {}
    }

}

export const ChainedIterator = <T>(iterator : Iterable<T>) : ChainedIteratorClass<T> => new ChainedIteratorClass<T>(iterator)
export type ChainedIterator<T> = ChainedIteratorClass<T>

export const CI = ChainedIterator
