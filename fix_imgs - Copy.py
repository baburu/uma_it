import os
import urllib.request

urls = {
    "img/syrius_symboli_ssr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xXhJtEqfhcsgdafw3fdH2V6fnfnBx7Yam4DE0aWJSYMR__eKDcW1_1c9Ry_1i00hWWuupt7as6xU_LfJZoyq_OunvPe9RgDArx8NADhdZ7pqViBT_UmoXdnD3jXGeeYdDeuvsU4VYknlIQM=s101-w101-h99",
    "img/rice_shower_ssr_stamina.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xWH9wnoM4zt8y5pVlV2kbTDI4gZmgaqHgfqCFEFQctDXmMQYqm_lR8KOLlR8JFSwGW5EXX-fuiqdW8TQvhcOsf321GDiFLnebymzWS2ZYPP2M9r725hTBa2GmmE99jcugwAX3R_ElymIx8=s101-w101-h99"
}

os.makedirs("img", exist_ok=True)
headers = {"User-Agent": "Mozilla/5.0"}

for path, url in urls.items():
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(path, "wb") as f:
        f.write(resp.read())
    print(f"✅ Downloaded: {path}")