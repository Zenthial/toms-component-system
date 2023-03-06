import { CollectionService } from "@rbxts/services";
import { Component } from "./types";

interface P {}

// 8 second timeout
const TIMEOUT = 8 

// using the fact that const means the value can't be changed, not the actual map here
const component_tag_map = new Map<string, typeof Component<P>>();

function make_component<T extends typeof Component<P>>(instance: Instance, component: T) {
    const component_instance = new component(instance);
    component_instance.__INSTANCES.set(instance, component_instance)

    task.spawn(() => component_instance.start())
}


function remove_component(instance: Instance, component_tag: string) {
    const component = tcs.get_component(instance, component_tag)
    if (component) {
        component.destroy()
        component.__INSTANCES.delete(instance)
    }
}

// will error if component does not exist after TIMEOUT
function wait_for_component(component_tag: string): typeof Component<P> {
    let component = component_tag_map.get(component_tag);
    
    const start = os.time();
    while (!component) {
        component = component_tag_map.get(component_tag);

        if ((os.time() - start) > TIMEOUT) {
            error(`COMPONENT TIMEOUT FOR TAG ${component_tag}`);
        }
    }

    return component;
}

// will error if component does not exist after TIMEOUT
// looking for the specific component instance, rather than the component class
function wait_for_component_instance(instance: Instance, component_tag: string): Component<P> {
    const component = component_tag_map.get(component_tag) as unknown as Component<P>;
    const instance_map = component.__INSTANCES;
    let component_instance = instance_map.get(instance)
    
    const start = os.time();
    while (component_instance === undefined) {
        component_instance = instance_map.get(instance);

        if ((os.time() - start) > TIMEOUT) {
            error(`COMPONENT_INSTANCE TIMEOUT FOR TAG ${component_tag} on ${instance.Name}${instance}`);
        }
    }

    return component_instance as unknown as Component<P>;
}

namespace tcs {
    export function get_component(instance: Instance, component_tag: string): Component<P> | undefined {
        const component_class = component_tag_map.get(component_tag) as unknown as Component<P>;
        if (!component_class) return undefined;

        const possible_component = component_class.__INSTANCES.get(instance);
        if (possible_component === undefined) {
            return undefined;
        }

        return possible_component as Component<P>
    }

    // typically it is best to await components instead of getting them, unless you know the components will already exist
    export function await_component(instance: Instance, component_tag: string) {
        const component_instance = get_component(instance, component_tag);

        if (!component_instance) {
            wait_for_component(component_tag);
            return wait_for_component_instance(instance, component_tag);
        }

        return component_instance;
    }

    export function create_component(
        component: typeof Component<P>,
        component_tag: string,
        component_ancestor: Instance,
        component_display_name ?: string
    ): void {
        assert(component_tag, "Component name is required");
        assert(
            typeOf(component_tag) === "string",
            "Component name must be of type 'string'"
        );
        assert(component_ancestor, "Component ancestor is required");
        assert(
            typeOf(component_ancestor) === "Instance",
            "Component ancestor must be of type 'Instance'"
        );

        if (component_display_name !== undefined) {
            assert(
            typeOf(component_display_name) === "string",
            "Component display name must be of type 'string'"
            );
        }

        component_tag_map.set(component_tag, component);
        for (const instance of CollectionService.GetTagged(component_tag)) {
            if (component_ancestor.IsAncestorOf(instance)) {
                make_component(instance, component);
            }
        }

        // avoid double frame firing
        task.wait()

        CollectionService.GetInstanceAddedSignal(component_tag).Connect(instance => {
            if (component_ancestor.IsAncestorOf(instance)) {
                make_component(instance, component);
            }
        })

        CollectionService.GetInstanceRemovedSignal(component_tag).Connect(instance => {
            remove_component(instance, component_tag)
        })
    }
}

export default tcs;