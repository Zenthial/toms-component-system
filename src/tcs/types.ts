export default abstract class Component {
    static __INSTANCES: Map<Instance, Component>;

    constructor(protected Root: Instance) {}

    public abstract start(): void;

    public abstract destroy(): void;
}
