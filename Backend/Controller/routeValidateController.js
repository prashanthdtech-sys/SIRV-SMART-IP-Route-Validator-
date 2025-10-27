require("dotenv").config();

// Convert comma-separated input into an array (max 5 IPs/CIDRs)
function subnetArrayList(queryList) {
  if (!queryList || typeof queryList !== "string") return [];
  const queryArray = queryList
    .trim()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (queryArray.length > 5) {
    return 0; // Exceeds max allowed
  }
  return queryArray;
}

const getRPKI = async (req, res) => {
  let queryList = req.query.ip;

  // Handle direct encoded URL queries
  if (!queryList) {
    const rawUrl = decodeURIComponent(req.originalUrl.split("?ip=")[1] || "");
    queryList = rawUrl;
  }

  const ipAddrList = subnetArrayList(queryList);
  const irrURL =
    process.env.IRR_EXPLORER_URL;
  const results = [];

  try {
    if (ipAddrList === 0) {
      return res.json({
        status: "Failed",
        message: "Query exceeds the maximum allowed (5 entries).",
      });
    }

    if (ipAddrList.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "No valid IP/CIDR provided.",
      });
    }

    for (const ip of ipAddrList) {
      console.log("Querying:", `${irrURL}${ip}`);
      const response = await fetch(`${irrURL}${ip}`);

      if (!response.ok) {
        results.push({
          prefix: ip,
          error: `API request failed (${response.status})`,
        });
        continue;
      }

      const jsonData = await response.json();
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      for (const item of dataArray) {
        results.push({
          prefix: item.prefix || ip,
          rir: item.rir || null,
          rpkiRoutes: item.rpkiRoutes?.length
            ? item.rpkiRoutes.map((r) => ({
                asn: r.asn || null,
                rpkiStatus: r.rpkiStatus || null,
              }))
            : [],
          bgpOrigins: Array.isArray(item.bgpOrigins) ? item.bgpOrigins : [],
          irrRoutes: Object.fromEntries(
            Object.entries(item.irrRoutes || {}).map(([db, arr]) => [
              db.toLowerCase(),
              arr?.length
                ? {
                    asn: arr[0]?.asn || null,
                    rpkiStatus: arr[0]?.rpkiStatus || null,
                  }
                : null,
            ])
          ),
          categoryOverall: item.categoryOverall || "UNKNOWN",
          messages: item.messages || [],
        });
      }
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error in /rpki-check:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = getRPKI;
