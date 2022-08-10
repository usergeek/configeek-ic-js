"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRegistry_canister_ids = void 0;
var prod_registry_canisters = {
    registry0: "a2ijm-aiaaa-aaaah-qc3za-cai",
    registry128: "a5jpy-nqaaa-aaaah-qc3zq-cai"
};
exports.configRegistry_canister_ids = process.env["CONFIG_REGISTRY_CANISTER_IDS"] || [prod_registry_canisters.registry0, prod_registry_canisters.registry128];
//# sourceMappingURL=constants.js.map