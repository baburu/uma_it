import os
import json
import urllib.request

# Direct CDN links extracted from your HTML sheet
IMAGE_URLS = {
    "img/air_shakur_ssr_wit.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVHgak2-9PXY9XS6_4OcwkV3NBci-D1HAoxHDG8suzYXDlV8U48DhJDlL0V02wH-EWa62zPKOyyoF5prwdozjs_s8jAJy3TxUef7gNUxkcaoPindnLR2AKWFwFxuhtCtizMytO9lrd-K_HI=s101-w101-h99",
    "img/hishi_akebono_ssr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xUfJpm94iXXxfPQcfSF3_94wL6I70iKyokrZ0wx2Hif9tjDOM_EejDzLC0kVn0uS1C3h5d7MiYMlAztre1dKfCmaEKdKeTEhUrEqROuHbpndiSVCGXNfugopa_YmRcLSQr1IuPIatC08fg=s101-w101-h99",
    "img/sakura_bakushin_o_ssr_guts.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVZrGsIwoXeU9G7igKl9L6q_f7S8Dt9oUsZfyt_wafu3ARyXQpKEN6Gwazfj_jVlCoRx8kG2uDUapbzHwY3qgah301wq9u1FVAoo1GTVCKf_llXjaoorZunuu9PxIRzEvb2XNe7zY76QDJv=s101-w101-h99",
    "img/seeking_the_pearl_ssr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVkLkD-s0HgIiQ9KXrwfJx23QH5r01Xq1Rub1IQlJkq3khjgtgFhJcCZ9ntXYrPmnI8-jH0ghDJk5vlyaB6e1C2f7uMO_kthYCrcsA5OcCjf45g5wbYQg-UF7gtFwrfUYlDKYzD4f5s8yo=s101-w101-h99",
    "img/oguri_cap_ssr_power.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xXFtJrVLkdpMhAbgOXIuqtu_TPr39b3i2EXSWQb-yv0QWeAP3wKGizsIo_FaYo8X5_Tic8fDEERYTyo7huxxhIw6ru_fJgRqgpu8SyjpYROMsQNOxfvpc4RvHrOv6NOC77KXyy-NqCOwDuh=s101-w101-h99",
    "img/winning_ticket_ssr_power.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVq2Y-GUoLifDkHIJ4pSxGee-ddeMlwJnSao_yPz-ZqpmPpf3pJ6EPL7-z16-HluBt9O9qJUoBLKlOuN9xmwsanYIXZ6X_LWLEFXQztDp10OcNfoNdWey2GhFgHSDzOonxIpo3UTjUKyhzP=s101-w101-h99",
    "img/vodka_ssr_power.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xWal3_5mU_XjFYM4-c7aKuiw8lUJaYIgsQ049UdWt69NyoQJdQ3UhD3GM0awYGGGWnDPEx_Af7d_B0AwlzGXwHTEtrSmmFas91sg9S2sqVGFKc00r84LdwnJ17xBvuTgo4pklWCBJ1nkcZx=s101-w101-h99",
    "img/bamboo_memory_ssr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xWurI5Y_pw3vN5TjTLpCyHAzpfqCiRGRDcogl8QrAbvZCbmdAsb9Um4tklMkpUikI5e83Mf0u5QIUzUBjP75i6UKRkZth5XEPtPnJwdjT2BOAWPZwFNUY4KGzuIJZcKh6DpJxqho1B2Pjjz=s101-w101-h99",
    "img/twin_turbo_ssr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xUoADrbKUYt3yLGhRXxOdMcc93rAOBCMTQRZCrOWGzigJgl1PSIxByXsVChMuzZDMFTj1c40qXBx1ZO8A5b1DfVfWr6Jmq_sl_ShkTKtgZFVagM_2y5OLtO9G6wPAmGMtzG4R1T1bHY4-Dz=s101-w101-h99",
    "img/curren_chan_sr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVDKVJOVGnZCGPemRbHO19kvgI4_zHsZVqPRxIVoffGoXyO6rbEjcq0pQG3s2yrtKuW1UUKFnUFV2nDxq8xZrWdDBd12LRPsf2CqdescKAhI-c9sAhn17OOpmSeK9jatwLadK_pULD87Coe=s101-w101-h99",
    "img/narita_taishin_sr.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xXW00sQ83FivcaW2PQt9_Bgo7En-FkOW6gmW1b3dUA308BJ22vbkc3W0MWtZswgwNL2oGdar9mtIZ98OzwpO4nuor7vAo1FABxzrrMgmYP3IjvEzv_8Tsr8CHvkWMQyK_ZbCGkAw4GJToC9=s101-w101-h99",
    "img/gold_ship_ssr_speed.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xV4uXckW6ZOsYSAODqtx4M-lcMt7UpHxlB5vbwI7vLqm8igq-_0BroGN927Dn6AjY686JOREWIHyW_7FNK1EttlRBvyYrAT-Jo3Y6-ylXyVvecNwE_NYkf_BuCkWuT62ye_n7Nnfp_ikfs=s101-w101-h99",
    "img/silence_suzuka_ssr_speed.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xVshosFUJbaBO8jvhSevHv39HnHlWDR6SOi-pFiVMVyEJpkfC1sL12rh8cOcYb9qFaKDMuAy363vmEiqEy_UUIJW-R14o2ZMRpbIAiYt2oMKuQ9fW8fPJDoYZJ2FUVHzHxInK0PsBQp1vw=s101-w101-h99",
    "img/ines_fujin_ssr_guts.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xUKl5I3QSK5KtTGApJN5UoI9zAUAYjcl7-rr0YnX1ZuHb4QND6L_MP-oYGuqfcaq_ECTvvrIon6pSsEY3qZmccAg0zX5Q4FlphFASFaCD4C91V5syIDg3PUINFogGVqi_JqVYikdVoRx7rv=s101-w101-h99",
    "img/oguri_cap_sr_guts.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xXZuha0pkMzZACYRWGRUU1QalJVdTIJk_DKp_ZVF7DmUOxZ90uTJvBTVD85lQd3TYx0vzMKWpf56yx1jfnmymSoqFoagZGhjBOj2t7CMm7Y2AIzoduETRVs5zpiIH3WZSawhlUkxhmww_5H=s101-w101-h99",
    "img/king_halo_sr_speed.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xWqaEb9tkCYDVzJKnPPhuHSdj2-c2QIOXvJjEE2C50xZ7CqEk1G5jTG--6s6WEsUlMgBXH1pyxDXtpZJ3YBWwtwY6aPS0rR--b9WaG5cfFdwFCzIdho8yV9w5W1-D7lrduz2quU9fJ9q7nw=s101-w101-h99",
    "img/rice_shower_ssr_wit.png": "https://lh3.googleusercontent.com/docsubipk/AP9E6xX1bFqg-na6LTFRWX2cihGY2TN6auJ-3pLiFaPIptvemA_8yiJozWNGF1SMwdmaw_VvYIgHLGjCqyQ6vuUHb0amH6xv_txBdwpsGbVA2MxmZdbAMWOKZAFkhqbOALDWIlFionlzgq6hVGl-=s101-w101-h99"
}

def download(url, path):
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with urllib.request.urlopen(req) as resp, open(path, "wb") as f:
        f.write(resp.read())

def main():
    fixed = 0
    print("Checking cards.json for missing images...")
    
    if os.path.exists("cards.json"):
        with open("cards.json", "r", encoding="utf-8") as f:
            cards = json.load(f)
        
        for c in cards:
            img = c.get("img")
            if img and not os.path.exists(img):
                url = IMAGE_URLS.get(img)
                if url:
                    print(f"📥 Downloading missing: {img} ({c['name']})...")
                    try:
                        download(url, img)
                        fixed += 1
                    except Exception as e:
                        print(f"❌ Failed: {e}")
                else:
                    print(f"⚠️ No URL for: {img}")

    # Also make sure all predefined images exist on disk
    for path, url in IMAGE_URLS.items():
        if not os.path.exists(path):
            print(f"📥 Downloading: {path}...")
            try:
                download(url, path)
                fixed += 1
            except Exception as e:
                print(f"❌ Failed: {e}")

    print(f"\n✅ Done! Fixed/downloaded {fixed} images.")

if __name__ == "__main__":
    main()