declare const Siesta : any

const project       = new Siesta.Project.Browser()

project.configure({
    title                   : 'ChronoGraph Test Suite',
    isEcmaModule            : true
})


project.start(
    {
        group       : 'class',

        items       : [
            'class/010_instanceof.t.js',
        ]
    },
    {
        group       : 'graph',

        items       : [
            'graph/010_walkable.t.js',
            'graph/020_node.t.js',
            'graph/030_cycle.t.js'
        ]
    },
    {
        group       : 'chrono',

        items       : [
            'chrono/010_identifier_variable.t.js',
            'chrono/011_lazy_identifier.t.js',
            'chrono/012_impure_calculated_value.t.js',
            'chrono/013_sync_calculation.t.js',
            // 'chrono/015_listeners.t.js',
            'chrono/020_graph_branching.t.js',
            'chrono/030_propagation.t.js',
            'chrono/031_garbage_collection.t.js',
            'chrono/032_propagation_options.t.js',
            'chrono/040_add_remove.t.js',
            'chrono/050_undo_redo.t.js'
        ]
    },
    {
        group       : 'chrono-userland',

        items       : [
            'chrono-userland/032_cycle_dispatcher.t.js'
        ]
    },
    {
        group       : 'replica',

        items       : [
            'replica/001_entity.t.js',
            'replica/002_fields.t.js',
            'replica/010_replica.t.js',
            'replica/020_reference.t.js'
        ]
    },
    {
        group       : 'schema',

        items       : [
            'schema/010_schema.t.js',
        ]
    }
)
