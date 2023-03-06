export interface ComponentInterface {
    start(): void;

    destroy(): void;
}
export class Component<T> implements ComponentInterface {
    __INSTANCES = new Map<Instance, T>();

    constructor(private Root: Instance) {}

    public start(): void {
        error("DID NOT IMPLEMENT START")
    }

    public destroy(): void {
        error("DID NOT IMPLEMENT DESTROY")
    }
}
