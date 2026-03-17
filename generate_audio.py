#!/usr/bin/env python3
"""Generate TTS audio files for all mantras in PuzaPaath using macOS 'say' command.
Uses Lekha (Hindi) voice for Devanagari mantras since it handles Sanskrit reasonably well.
"""
import subprocess
import os
import json
import re

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'src', 'assets', 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# All mantras extracted from pujaData.ts - id and roman text
# We use the roman transliteration for TTS as it's more reliably pronounced
MANTRAS = [
    # Part A
    ("A1", "Om Sham No Devir Abhishtye Apo Bhvantu Pitye. Shamyor Abhi Srvantu Nah."),
    ("A2", "Om Tat Sat Brahma Adhy Tavat Tithou Adye Masey Pakshey Tithou Varey Kale Gotrey Aham Janam Divasy Puja Karm Karishye."),
    ("A3", "Om Prithivyai Tvya Drita Loka Devi Tvm Vishnuna Drta. Tvm Ch Dharaya Mam Devi Pvitrm Kuru Chasnm."),
    ("A3a", "Asy Shri Asn Shodn Mntrsy Meruprshth Rishi Sutlm Chhndh Kurmo Devta Asan Shodn Viniyogh"),
    ("A4", "Prim Prithiviyai Adhar Shaktyai Smalubnm Gandho Nmh Arghyo Nmh Pushpm Nmh"),
    ("A5", "Sknd Adhar Shktyai Smalubnm Gndho Nmh Argo Nmh Pushpm Nmh"),
    ("A6", "Om Shuklmber Dhrm Vishnu, Shshivrnm Chturbhujam. Prsnn Vdnm Dyaye Srv Vignop Shantiyai."),
    ("A7", "Gurur Brahma Gurur Vishnu Gurudevo Maheshvara. Guruh Sakshat Parbrahm Tasmai Shri Gurave Namah. Gurve Namah Param Gurve Namah Parmacherya Namah. Adhi Siddhi Byo Namah."),
    ("A8", "Om Angushthabyam Nmh. Na Tarjinibyam Nmh. Ma Madhymabyam Nmh. Shi Anamikabyam Nmh. Va Kanishthakabyam Nmh. Ya Krtlskr Prasthabyam Nmh."),
    # A8 substeps
    ("A8a1", "Om Angushthabyam Nmh"),
    ("A8a2", "Na Tarjinibyam Nmh"),
    ("A8a3", "Ma Madhymabyam Nmh"),
    ("A8a4", "Shi Anamikabyam Nmh"),
    ("A8a5", "Va Kanishthakabyam Nmh"),
    ("A8a6", "Ya Krtlskr Prasthabyam Nmh"),
    ("A8b1", "Om Hrdyaye Nmh"),
    ("A8b2", "Na Shirse Svaha"),
    ("A8b3", "Ma Shikhaye Vsht"),
    ("A8b4", "Shi Kvchay Hum"),
    ("A8b5", "Va Netrabyam Nmh"),
    ("A8b6", "Ya Astray Phat"),
    ("A9", "Apasarpantu Te Bhuto Ye Bhuta Bhuvi Samsthitah. Ye Bhuta Vigna Kartaras Te Gacchantu Shivajnaya."),
    ("A11", "Tirthey Sneym Tirthm Ev Smanam Bhvti Manh. Shmso Arrushho Dhurtih Prann Mrtysy Rkshano Brhmnspti."),
    ("A12", "Iti Mnantr Snamiyni Nmh"),
    ("A13", "Vsoh Pvitrm Asi Shtdharm Vsunam Pvitrm Asi Shstr Dharm. Aykshma Vh Prjya Smsrjami Rays Poshhen Bhula Bhvnti."),
    # A14 substeps
    ("A14a", "Parmatmne Purushhotmaye Pnch Bhutatmkay Vishvatmne Mntr Nathay Atmne Naraynay Adhar Shktyai Smalubnm Gndho Nmh Argo Nmh Pushpam Nmh."),
    ("A14b", "Sv Prakasho Mha Diph Srvtstimiraph Prasid Mm Govind Dipaym Priklpita."),
    ("A14c", "Vnespati Rso Divyo Gndhadya Gndvt Tmh Adhar Sktyai Srv Devanam Dupo Nmh Argo Nmh Pushpm Nmh."),
    ("A14d", "Nm Dhrm Nidanay Nmh Svkrt-Sakshnai Nmh Prtiksh Devay Shri Baskeray Nmh Argo Nmh Pushpm Nmh Gndo Nmh."),
    ("A14e", "Mntrartha Sflah Sntu Purnh Sntu Northah. Shtrunam Buddhi Nashstu Mitrnam Udyestv. Ayur-Arogym-Eshvrym Ett Tritym Astute Jiv Tvm Shrdh Shtm."),
    ("A15", "Ytrasti Mata Na Pita Nm Bnduh Bratapi Na Ytr Suht Jnsh Ch Na Jnayte. Ytr Dinm Na Ratre Ttratvm Dipm Shrnm Prphye. Atmne Naraynay Adhar Shktyai Dip Dup Snklpat Siddhir Astu. Dipo Nmh Dhupo Nmh."),
    # Part B
    ("B0", "Shanta Kaarm Bhujeg Shaynam Padam Nabham Suresham. Wishwadaram Gagan Sadreshyam Meghvarnam Shulbhangam. Lakhshimi Kantam Kamal Naynam Yogbir Dyan Gameyam. Vandey Veshnum Bhaw Bhaye Haram Sarw Lokaiyk Natham."),
    ("B1", "Avahi Spt Janmotsv Devtabhyh Asvathanane, Blye, Vyasay, Hanumte, Krpacharyay, Markndeyay, Prshuramay. Bhktanugrh Kark Asmat Dyanurdhen Snnidhanum Kuru Prbhu. Archami Nmh."),
    ("B2", "Smvh Srjami Hrdym Smsrshht Mnoastu Vh. Smh Srshtastnvh Sntu Vh Sm Srshhth. Prano Astu Vh Smyavh Priyh Tnvh. Sm Priyh Hrdyani Vh. Atma Vo Astu Sm Priya Sm Priyh Tnvomm."),
    ("B3", "Spt Jnmotsv Devtabhyh Gngadi Srv Tirtha byo Anitm Toym Uttmm. Padhartham Samarpayami Granantu."),
    ("B4", "Gnd Pushpakshtlair Yuktm Gryni Sampaditm Mya. Grhnntv Argym Prasanashch Bhvntu Me Srvda. Spt Jnmotsv Devtabhyh Argyam Samarpiyamey Nmh."),
    ("B5", "Krpuren Sughndhn Vasitm Svad Shitlm Toym Achmanyrthm Grhnuntu Spt Janmotsv Devtabhyh."),
    ("B6", "Spt Jnmotsv Devtabhyh Panchdash Snanum Samarpayami Nmh."),
    ("B7", "Spt Jnmotsv Devtabhyh Vstrm Samarpyami Nmh."),
    ("B8", "Srveshvr Jgt Vindya Divyasnm Susmsthita. Gndh Grhan Devesh Divgndop Shobitm. Spt Janam Devtabyo Smalbnm Gndo Nmh."),
    ("B9", "Jy Narayn Jy Purushottm Jy Vamn Knsare. Uddhr Mam Suresh Vinashin Ptitohm Snsare. Ghorm Hr Mm Nrk Ripo Keshv Klmshbharm. Mam Anukmpy Dinm Anathm Kuru Bhv Sagr Parm."),
    # B9 verses
    ("B9v1", "Jy Narayn Jy Purushottm Jy Vamn Knsare. Uddhr Mam Suresh Vinashin Ptitohm Snsare. Ghorm Hr Mm Nrk Ripo Keshv Klmshbharm. Mam Anukmpy Dinm Anathm Kuru Bhv Sagr Parm."),
    ("B9v2", "Jy Jy Dev Jya Sursudn Jy Keshv Jy Vishnu. Jy Lkshmi Mukh Kml Mdhuvrt Jy Dshkndhr Jishno. Ghorm Hr Mm."),
    ("B9v3", "Ydypi Sklm Ahm Klyami Hre Nhi Kim Api S Stvm. Tt Api N Munchti Mam Idm Achyut Putrkltr Mmtvm. Ghorm Hr Mm."),
    ("B9v4", "Punr Api Jnmm Punr Api Mrnm Punr Api Grbh Nivasm. Sodum Alm Punr Asmin Madhu Mam Uddhr Nijdasm. Ghorm Hr Mm."),
    ("B9v5", "Tvm Jnni Jnkh Prbhur Achyut Tvm Suhrt Kulmitrm. Tvm Shrnm Shrna Gt Vtsl Tvm Bhv Jldhi Vhitrm. Ghorm Hr Mm."),
    ("B9v6", "Jnk Suta Pti Chrn Prayn Shnkr Munivr Gitm. Dhary Mnsi Krishn Purushottm Vaary Smsrti Bhitim. Ghorm Hr Mm."),
    ("B10", "Amrtesh Mudrya Amrtikrty Amrtm Astu Amrtaytam Naivedym. Savitrani Savitrsy Devsy Tva Svituh Prsve Shivnor Bahubhyam Pushno Hstbhyam."),
    # Part C
    ("C1", "Apnnosmi Shrnyosmi Srvavsthasu Srvda. Bhgvn Tvam Prpnnosmi Rksh Mam Shrnagtm."),
    ("C2", "Yena Baddho Bali Raja Danavendro Mahabalah. Tena Tvam Pratibadhnami Rakshe Ma Chal Ma Chal."),
]

# Check available voices
def get_voice():
    """Pick best available Hindi voice for Sanskrit mantras."""
    result = subprocess.run(['say', '-v', '?'], capture_output=True, text=True)
    voices = result.stdout
    # Prefer Kiyara Premium > Lekha > any Hindi
    for v in ['Kiyara (Premium)', 'Kiyara', 'Lekha']:
        if v in voices:
            return v
    return 'Lekha'  # fallback

def generate_audio(mantra_id, text, voice):
    """Generate .aiff audio file using macOS say command, then convert to .mp3 via afconvert."""
    aiff_path = os.path.join(AUDIO_DIR, f'{mantra_id}.aiff')
    mp3_path = os.path.join(AUDIO_DIR, f'{mantra_id}.mp3')

    if os.path.exists(mp3_path):
        print(f'  SKIP {mantra_id} (exists)')
        return mp3_path

    # Generate with say
    subprocess.run([
        'say', '-v', voice, '-r', '130',  # slower rate for mantras
        '-o', aiff_path, text
    ], check=True)

    # Convert to mp3 (smaller, compatible everywhere)
    subprocess.run([
        'afconvert', '-f', 'mp4f', '-d', 'aac',
        '-b', '128000', aiff_path, mp3_path.replace('.mp3', '.m4a')
    ], check=True)

    # Actually let's keep as aiff for now since expo-av handles it fine on all platforms
    # and converting requires ffmpeg which may not be installed
    os.rename(aiff_path, aiff_path)  # keep aiff
    print(f'  OK {mantra_id} -> {aiff_path}')
    return aiff_path

def main():
    voice = get_voice()
    print(f'Using voice: {voice}')
    print(f'Generating {len(MANTRAS)} audio files...\n')

    generated = []
    for mantra_id, text in MANTRAS:
        # Use .m4a format (AAC) - works everywhere and is smaller
        m4a_path = os.path.join(AUDIO_DIR, f'{mantra_id}.m4a')
        aiff_path = os.path.join(AUDIO_DIR, f'{mantra_id}.aiff')

        if os.path.exists(m4a_path):
            print(f'  SKIP {mantra_id} (exists)')
            generated.append(mantra_id)
            continue

        # Generate aiff
        subprocess.run([
            'say', '-v', voice, '-r', '120', '-o', aiff_path, text
        ], check=True)

        # Convert to m4a (AAC - small, cross-platform)
        subprocess.run([
            'afconvert', '-f', 'm4af', '-d', 'aac',
            aiff_path, m4a_path
        ], check=True)

        # Remove intermediate aiff
        os.remove(aiff_path)

        size_kb = os.path.getsize(m4a_path) / 1024
        print(f'  OK {mantra_id} ({size_kb:.0f} KB)')
        generated.append(mantra_id)

    print(f'\nDone! Generated {len(generated)} audio files in {AUDIO_DIR}')
    total_size = sum(os.path.getsize(os.path.join(AUDIO_DIR, f)) for f in os.listdir(AUDIO_DIR) if f.endswith('.m4a'))
    print(f'Total size: {total_size / 1024 / 1024:.1f} MB')

if __name__ == '__main__':
    main()
