import { CollectionService } from "@rbxts/services";

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
}

export default tcs;
