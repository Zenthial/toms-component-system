import { CollectionService } from "@rbxts/services";

// seconds before erroring when looking for a component
const TIMEOUT = 8;

interface ComponentInstance {
    start(): void;
    destroy(): void;
}

interface ComponentClass {
    __INSTANCES: Map<Instance, ComponentInstance>;
    new(root: Instance): ComponentInstance;
}

function make_component(instance: Instance, component: ComponentClass) {
    let component_instance = new component(instance);
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

namespace tcs {
    export function register_component(component: ComponentClass, component_tag: string, component_instance: Instance) {
        for (let possible_instance of CollectionService.GetTagged(component_tag)) {
            if (component_instance.IsAncestorOf(possible_instance)) {
                make_component(possible_instance, component);
            }
        }
    }

    export function get_component<P extends ComponentInstance, T extends ComponentClass>(instance: Instance, component: T): P | undefined {
        let component_instance = component.__INSTANCES.get(instance);

        return component_instance as unknown as P;
    }

    // may error
    export function await_component<P extends ComponentInstance, T extends ComponentClass>(instance: Instance, component: T): P {
        return wait_for_component_instance(instance, component) as P;
    }
}

export default tcs;
