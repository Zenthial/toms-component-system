import { tcs, Component } from "./tcs";

class TestComponent extends Component {
    TAG = "TestComponent";
    INSTANCE = game;

    constructor(root: Instance) {
        super(root);
    }

    public start(): void {

    }

    public destroy(): void {

    }

    public test_method() {
        print(this.Root.Name);
    }
}

tcs.create_component(TestComponent);

const instance = new Instance("Part");
const instance_component = tcs.get_component<TestComponent>(instance, TestComponent);

if (instance_component) {
    instance_component.test_method();
}

