import { CollectionService } from "@rbxts/services";
import { Component } from "./types";

interface P {}

// using the fact that const means the value can't be changed, not the actual map here
const component_tag_map = new Map<string, typeof Component<P>>();

function make_component<T extends typeof Component<P>>(instance: Instance, component_tag: string, component: T) {
    const component_instance = new component(instance);
    component_instance.__INSTANCES.set(instance, component)

    task.spawn(() => component_instance.start())
}


function remove_component(instance: Instance, component_tag: string) {
    const component = tcs.get_component(instance, component_tag)
    if (component) {
        component.destroy()
        component.__INSTANCES.delete(instance)
    }
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
                make_component(instance, component_tag, component);
            }
        }

        // avoid double frame firing
        task.wait()

        CollectionService.GetInstanceAddedSignal(component_tag).Connect(instance => {
            if (component_ancestor.IsAncestorOf(instance)) {
                make_component(instance, component_tag, component);
            }
        })

        CollectionService.GetInstanceRemovedSignal(component_tag).Connect(instance => {
            remove_component(instance, component_tag)
        })
    }
}

export default tcs;