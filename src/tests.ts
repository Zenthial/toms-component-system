import tcs from "./tcs";
import { Component } from "./tcs/types";

class TestComponent extends Component<TestComponent> {
    constructor(root: Instance) {
        super(root);
    }

    public start(): void {

    }

    public destroy(): void {

    }
}

tcs.create_component(TestComponent, "TestComponent", game);