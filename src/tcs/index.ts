import { CollectionService } from "@rbxts/services";

// seconds before erroring when looking for a component
const TIMEOUT = 8;

interface ComponentInstance {
    start(): void;
    destroy(): void;
}

interface ComponentClass {
    __INSTANCES: Map<Instance, ComponentInstance>;
    TAG: string,
    INSTANCE: Instance,

    new(root: Instance): ComponentInstance;
}

function make_component(instance: Instance, component: ComponentClass) {
    const component_instance = new component(instance);
    component.__INSTANCES.set(instance, component_instance);

    task.spawn(() => component_instance.start());
}

function wait_for_component_instance(instance: Instance, component: ComponentClass): ComponentInstance {
    let component_instance = component.__INSTANCES.get(instance);

    const start = os.time();
    while (component_instance === undefined) {
        component_instance = component.__INSTANCES.get(instance);

        if ((os.time() - start > TIMEOUT)) {
            error(`COMPONENT ${component} DOES NOT EXIST ON INSTANCE ${instance}`)
        }

        task.wait();
    }

    return component_instance;
}

function remove_component(instance: Instance, component: ComponentClass) {
    const component_instance = tcs.get_component<ComponentInstance>(instance, component);

    if (component_instance) {
        component_instance.destroy()
        component.__INSTANCES.delete(instance)
    }
}

namespace tcs {
    export function create_component(component: ComponentClass) {
        let component_tag = component.TAG;
        let component_instance = component.INSTANCE;
        
        assert(component_tag !== undefined, `Component tag is not defined on component ${component}`);

        for (const possible_instance of CollectionService.GetTagged(component_tag)) {
            if (component_instance.IsAncestorOf(possible_instance)) {
                make_component(possible_instance, component);
            }
        }

        // avoid double firing
        task.wait()

        CollectionService.GetInstanceAddedSignal(component_tag).Connect(instance => {
            if (component_instance.IsAncestorOf(instance)) {
                make_component(instance, component);
            }
        })

        CollectionService.GetInstanceRemovedSignal(component_tag).Connect(instance => {
            remove_component(instance, component)
        })
    }

    export function get_component<T>(instance: Instance, component: ComponentClass): T | undefined {
        const component_instance = component.__INSTANCES.get(instance);

        return component_instance as unknown as T
    }

    // may error
    export function await_component<P extends ComponentInstance, T extends ComponentClass>(instance: Instance, component: T): P {
        return wait_for_component_instance(instance, component) as P;
    }

    export function has_component(instance: Instance, component: ComponentClass): boolean {
        return component.__INSTANCES.get(instance) !== undefined
    }
}

export default tcs;
