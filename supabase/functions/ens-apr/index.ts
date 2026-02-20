import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ENS_TOKEN = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";
const GET_VOTES_SELECTOR = "0x9ab24eb0";
const RPC_URL = "https://eth.llamarpc.com";

const ACTIVE_DELEGATES = [
  "0x5bfcb4be4d7b43437d5a0c57e908c048a4418390",
  "0x89ede5cbe53473a64d6c8df14176a0d658daaedc",
  "0x81b287c0992b110adeb5903bf7e2d9350c80581a",
  "0xb8c2c29ee19d8307cb7255e1cd9cbde883a267d5",
  "0x809fa673fe2ab515faa168259cb14e2bedebf68e",
  "0x4e88f436422075c1417357bf957764c127b2cc93",
  "0x1d5460f896521ad685ea4c3f2c679ec0b6806359",
  "0x534631bcf33bdb069fb20a93d2fdb9e4d4dd42cf",
  "0x983110309620d911731ac0932219af06091b6744",
  "0x048aa782fb1ebc07b410aab4af1456be23220493",
  "0xd5d171a9aa125af13216c3213b5a9fc793fccf2c",
  "0xa7860e99e3ce0752d1ac53b974e309fff80277c6",
  "0x839395e20bbB182fa440d08F850E6c7A8f6F0780",
  "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
  "0x5d5d4d04B70BFe49ad7Aac8C4454536070dAf180",
  "0xf01Dd015Bc442d872275A79b9caE84A6ff9B2A27",
  "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  "0x7e05540A61b531793742fde0514e6c136b5fbAfE",
  "0x17296956b4E07Ff8931e4ff4eA06709FaB70b879",
  "0xDbF14eA9E062Cf6F5D5dBe20B32aDFB39Fe79F6C",
  "0xb6f706C5b1d0465CBCF5a4572E837F4B2Be65F2E",
  "0x2686BdEB5E5C394E6b0B1cDabc353AB5a4e3c74f",
  "0x6f9BBcaA06e98573c41666102d79219b62aEd8fC",
  "0x179A862703a4adfb29896552DF9e307980D19285",
  "0x8e8Db5CcEF88cca9d624701Db544989C996E3216",
  "0xd7a029Db2585553978190dB5E85eC724aa4dF23f",
  "0x5F4bcccB5C2CBB01c619F5CfED555466e31197b6",
  "0x323A76393544d5ecca80cd6ef2A560C527bC2fcf",
  "0xDc652C746A8F85e18Ce632d97c6118e8a52fa738",
  "0x37d0857ACD53b767ceA9443AdC1857f2b808a83f",
];

const DELEGATOR_SHARE = 0.9;

const REWARD_TIERS = [
  { maxIncrease: 10, pool: 5000 },
  { maxIncrease: 20, pool: 8000 },
  { maxIncrease: 30, pool: 10000 },
  { maxIncrease: 50, pool: 15000 },
  { maxIncrease: 75, pool: 20000 },
  { maxIncrease: 100, pool: 25000 },
  { maxIncrease: Infinity, pool: 30000 },
];

function getMonthlyPool(vpIncreasePercent: number): number {
  for (const tier of REWARD_TIERS) {
    if (vpIncreasePercent <= tier.maxIncrease) {
      return tier.pool;
    }
  }
  return REWARD_TIERS[REWARD_TIERS.length - 1].pool;
}

function padAddress(addr: string): string {
  return "0x" + addr.replace("0x", "").toLowerCase().padStart(64, "0");
}

async function getVotes(delegateAddr: string): Promise<bigint> {
  const data = GET_VOTES_SELECTOR + padAddress(delegateAddr).slice(2);
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to: ENS_TOKEN, data }, "latest"],
  });

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await res.json();
  if (json.error || !json.result || json.result === "0x") {
    return 0n;
  }
  return BigInt(json.result);
}

async function batchGetVotes(
  delegates: string[]
): Promise<Map<string, bigint>> {
  const calls = delegates.map((addr, i) => ({
    jsonrpc: "2.0" as const,
    id: i,
    method: "eth_call" as const,
    params: [
      { to: ENS_TOKEN, data: GET_VOTES_SELECTOR + padAddress(addr).slice(2) },
      "latest",
    ],
  }));

  const BATCH_SIZE = 15;
  const results = new Map<string, bigint>();

  for (let i = 0; i < calls.length; i += BATCH_SIZE) {
    const batch = calls.slice(i, i + BATCH_SIZE);
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });

    const json = await res.json();
    const responses = Array.isArray(json) ? json : [json];

    for (const resp of responses) {
      const idx = typeof resp.id === "number" ? resp.id : parseInt(resp.id);
      const addr = delegates[idx];
      if (resp.result && resp.result !== "0x") {
        results.set(addr, BigInt(resp.result));
      } else {
        results.set(addr, 0n);
      }
    }
  }

  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const votesMap = await batchGetVotes(ACTIVE_DELEGATES);

    let totalEligibleSupplyRaw = 0n;
    for (const votes of votesMap.values()) {
      totalEligibleSupplyRaw += votes;
    }

    const totalEligibleSupply =
      Number(totalEligibleSupplyRaw / 10n ** 14n) / 10000;

    const vpIncreasePercent = 0;
    const monthlyPool = getMonthlyPool(vpIncreasePercent);
    const monthlyDelegatorPool = monthlyPool * DELEGATOR_SHARE;
    const apr =
      totalEligibleSupply > 0
        ? (monthlyDelegatorPool * 12) / totalEligibleSupply
        : 0;
    const aprPercent = apr * 100;

    return new Response(
      JSON.stringify({
        aprPercent: parseFloat(aprPercent.toFixed(2)),
        totalEligibleSupply: parseFloat(totalEligibleSupply.toFixed(2)),
        monthlyPool,
        monthlyDelegatorPool,
        delegateCount: ACTIVE_DELEGATES.length,
        vpIncreasePercent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
