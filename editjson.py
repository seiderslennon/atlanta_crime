import json

# Only keep this attribute from properties
keep_attrs = {"Crime_Against"}

with open("data/crimes.geojson", "r") as f:
    data = json.load(f)

# Strip out extra properties
for feature in data["features"]:
    props = feature.get("properties", {})
    feature["properties"] = {
        k: v for k, v in props.items() if k in keep_attrs
    }

    # Optional: remove non-Point geometries just in case
    if feature["geometry"]["type"] != "Point":
        raise ValueError("Non-point geometry found")

# Save reduced file
with open("data/crimes_reduced.geojson", "w") as f:
    json.dump(data, f, indent=2)