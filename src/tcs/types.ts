export default abstract class Component {
    static __INSTANCES: Map<Instance, Component>;
    static TAG: string;
    static INSTANCE: Instance = game;

    constructor(protected Root: Instance) {}

    public abstract start(): void;

    public abstract destroy(): void;
}
