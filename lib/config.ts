/**
 * Network Configuration
 *
 * Configure your IOTA networks and package IDs here
 */

import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

// Package IDs - update DEVNET_PACKAGE_ID after deploying ticket_box
export const DEVNET_PACKAGE_ID = "0xdaed73e0337b1e040c4a0c6e10b13f517e0d910b15a75d3202645ceaaf4e6adf";
export const TESTNET_PACKAGE_ID = "";
export const MAINNET_PACKAGE_ID = "";

// Network configuration
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: DEVNET_PACKAGE_ID,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: TESTNET_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: MAINNET_PACKAGE_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
