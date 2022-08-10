import {ConfigeekClient, InitConfig} from "./ConfigeekClient";
import {ReplicaConfig} from "./ic/ActorFactory";

const Configeek = new ConfigeekClient()

export {Configeek, InitConfig, ReplicaConfig}