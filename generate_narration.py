#!/usr/bin/env python3
"""Generate English narration audio using macOS Ava Premium voice.
Conversational tone — guide explaining to user, not reading text."""
import subprocess, os

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'src', 'assets', 'audio', 'narration')
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICE = "Ava (Premium)"
RATE = 160  # slightly slower for conversational warmth

# All narrations — conversational, warm, explanatory tone
NARRATIONS = {
    "A1": "So we begin with Achman — this is how you purify yourself before the puja starts. Take a tiny amount of water in your right palm and sip it three times. It's really simple, but what you're doing is quite profound — you're asking the divine waters to cleanse your body and mind. Think of it as washing away the noise of everyday life so you can be fully present for this sacred moment. The mantra is a prayer to the water gods, asking them to shower blessings, joy, and welfare upon you.",

    "A2": "Now comes the Sankalp — this is your formal vow. Pick up a handful of flowers and hold them in your hands. What you're doing here is announcing your intention to the universe. You'll state today's date, your family gotra, and the name of the person whose birthday puja this is. It's like signing a sacred contract — you're making a commitment that yes, I am performing this puja today, and I am doing it with full devotion. This is a very important step because it sets the foundation for everything that follows.",

    "A3": "This step is called Aasan Shodan — you're purifying the place where you'll sit and worship. Take the Vishthur, that piece of darbha grass with a knot, dip it in water from your pranipatr cup, and sprinkle it over your seat. The mantra speaks to Mother Earth, saying that she supports all the worlds and Lord Vishnu supports her. You're asking her to support you too, and to make your seat sacred and pure for the puja.",

    "A4": "Now we honor Mother Earth herself — this is Prithvi Pujan. Take some tilak paste, arghya, and flowers and apply them to the floor right in front of you. You're bowing to the Earth as the foundation of everything — she holds us up, she nourishes us, she is the support of all primal energy. It's a moment of gratitude for the ground beneath your feet.",

    "A5": "And just as we honored the Earth, now we look upward — this is Aakash Pujan, honoring the sky. Hold your tilak, flowers, and arghya up toward the sky with your fingers, then place them in the nirmal plate. You're acknowledging the vastness above, the sky that encompasses everything. Together with Prithvi Pujan, you've now paid respects to both Earth below and sky above, surrounding yourself with the sacred.",

    "A6": "Here comes Ganesh Pujan — and as you probably know, Lord Ganesh is always worshipped first because he is the remover of obstacles. Apply tilak, arghya, and flowers to the Ganesh photo or idol. The mantra describes him beautifully — dressed in white, glowing like the moon, with four arms representing power over all four directions, and always that happy, cheerful face. Even the other gods worship Ganesh when they need obstacles removed, so we ask for his blessings before we proceed.",

    "A7": "This is Guru Puja — honoring the teacher. You'll probably recognize this mantra — it's one of the most famous in Hindu tradition. It says the Guru is Brahma the creator, Vishnu the preserver, and Maheshwara the great lord. The Guru is actually the supreme divine being manifested to guide us. Apply tilak while you recite this. If your family has a specific Guru, you're honoring them here. If not, you're honoring the trinity of gods who are everyone's first teachers.",

    "A8": "This step is called Angnyas, and it's quite unique — you're placing different parts of your body under divine protection. Hold two pieces of darbha grass in your ring fingers and then touch body parts while chanting specific syllables. First all the fingers — thumbs, index, middle, ring, little fingers, and palms. Then the body — heart, forehead, top of head, shoulders, eyes, and finally strike your left palm. Each syllable is like a shield being placed on that part of you. This step is optional if you're doing the shorter puja.",

    "A9": "Bhu Shuddhi is about purifying the space around you. Take some black sesame seeds — we call them til — and throw them around yourself. You're driving away any negative energies or disturbances. The mantra is quite direct — it commands any spirits that might disturb your meditation to leave immediately, by the order of Lord Shiva himself. You're clearing the area, making it safe and sacred. This step is optional.",

    "A10": "This is Pranayam — regulated breathing. No mantra needed here, just close your eyes, calm your mind, and breathe in and out slowly three times. Everything so far has been purifying your body and space — now you're purifying your thoughts. Take your time with this. When you're done, you'll be in the right state of mind for the rest of the puja.",

    "A11": "Prokshana is about purifying your body with sacred water. Take the Vishthur from your pranipatr cup and sprinkle water on yourself. The mantra declares that this water should have the same purifying effect as if you'd traveled to a sacred pilgrimage site and bathed there. It asks the water to heal sickness and protect from death. So with this simple sprinkling, you're receiving the blessing of a holy pilgrimage. This step is optional.",

    "A12": "Marjana is interesting because unlike Prokshana, you don't use any water. The purification happens through the mantra itself — through sound and intention. Just by reciting the words, you're purifying your inner self. It shows that in the Vedic tradition, the spoken word carries real spiritual power. This step is also optional.",

    "A13": "Pavitri Dharna — now you put on the sacred ring. Take a ring made of dhurva grass, or a silver or gold ring, and place it on the ring finger of your right hand. This ring represents the eight Vasu devas, the beneficial cosmic forces. The mantra asks them to make you pure, to remove not just a hundred impurities but a thousand. It prays for freedom from ailments, for your family to grow large and happy, and for prosperity. Keep this ring on throughout the rest of the puja.",

    "A14": "Anulepna is a multi-part step — it's all about applying tilak. You'll do it five times. First, apply tilak paste made from chandan and saffron to your own forehead, invoking Vishnu by his many names. Then to the lamp, asking Govind to enlighten you. Then to the incense, honoring all the gods. Then gesture toward the sky for the Sun and heavenly deities. And finally — this is a beautiful moment — apply tilak to every family member present. The mantra blesses them with long life, health, prosperity, and wishes them a hundred autumns.",

    "A15": "This is the closing prayer of Part A. You pour water from the pranipatr through your right hand over the nirmal pot. The mantra is deeply meditative — it says, when I am so deep in meditation that I am unaware of my father, my mother, my brother — when I don't even know if it's day or night — in that state, I take refuge under the luminous light of Narayana, the primordial energy. This step is optional but beautifully completes Part A.",

    "B0": "Now we enter the heart of the birthday puja — Madhyam Bhaga. We begin by meditating on Lord Vishnu. Place the Nariwan — the sacred thread with seven knots, one for each divine Rishi — on something elevated inside a thali. The mantra is one of the most beloved in Hindu prayer — the Shantakaram verse. It describes Vishnu resting peacefully on the thousand-headed serpent, with a lotus blooming from his navel. He is the lord of all devas, vast as the sky, husband of Lakshmi, with lotus-like eyes, and the one who destroys all fear. Take a moment to really visualize this image.",

    "B1": "Avahan and Archam — this is where we welcome the seven immortal sages, the Devreshis. They are Ashwatthama, Bali, Vyasa, Hanuman, Kripacharya, Markandeya, and Parashurama — the seven beings said to be immortal, still alive in our world. Each of the seven knots on your Nariwan represents one of them. You're inviting them to be present at this puja, to take their seats, and to grant their divine blessings. The mantra acknowledges they are the ones who bless devotees with grace, and you humbly ask them to remain present and accept your worship.",

    "B2": "Pran Pratishtha — this is a really important step. You're bringing the Nariwan to life. Until now it was just a thread with knots, but through this ritual, it becomes a living embodiment of the seven Devreshis. Place water in the panchpatra cup along with vishthur or darbha. Recite three separate prayers, and after each one, put flower petals into the cup. Then sprinkle the water on the Nariwan. The first prayer says, I place you in the garland of my heart for continued union with my mind and life breath. The second asks Ashwatthama, Brahaspati, Mitra, and Varuna to bring the Devreshis to life. And the third names all seven sages specifically, declaring them alive and ready to receive offerings.",

    "B3": "This is Padya — washing the feet of the deities. It has two parts. First, purify the water by reciting the Apo Prashana mantra three times — the same purification prayer from step one. Then mix it with Panchamrit — milk, curd, honey, ghee, and gur — and sprinkle it over the Nariwan. The mantra is a humble request — it says, I have brought sacred water from the Ganges and all holy rivers for washing your feet. Please accept it. It's the same respect you'd show a honored guest — first, you wash their feet.",

    "B4": "Arghyam — now you're washing the hands and face of the deities. Prepare eight ingredients together — water, milk, curd, ghee, rice, barley, yellow mustard seeds, and vishthur. Mix these and pour over the Nariwan. You're asking the Devreshis to accept these offerings of tilak, flowers, and akshat, and to be happy with you, not just now, but always. It's a gesture of complete devotion — you're personally attending to the deities as a loving host.",

    "B5": "Dev Aachman — deity purification. After all those offerings of milk, curd, and other ingredients, the Nariwan needs to be cleansed. Pour pure water over it, and you can add camphor or scents to make it special. The mantra asks the Devreshis to accept this purification with cold, sweet water scented with camphor. Think of it like offering a refreshing drink after a bath.",

    "B6": "Now comes Dev Snan, also called Abhishek — the ceremonial bathing. This is done with Panchdashang — fifteen sacred ingredients. Let me list them: water, milk, curd, ghee, honey, sugar, mustard seeds, baked paddy, a mixture of sacred herbs, sandalwood paste, saffron, a gold or silver ring, a jewel, flowers, and knotted darbha. Pour each one over the Nariwan. Each ingredient carries its own spiritual significance. If you don't have all fifteen, you can substitute flowers for any missing item.",

    "B7": "Vastra Grahan — offering clothes. Just as you would dress a guest after their bath, you now offer clothes to the deity. Place a cloth on the Nariwan while reciting the mantra, which simply asks the Devreshis to accept these garments with your full reverence. A short but meaningful step.",

    "B8": "Dev Anulepna — applying tilak to the deity. Apply tilak to the Nariwan seven times, once for each of the seven Devreshis. The mantra addresses them as Almighty Rishis seated on their divine seats, asking them to accept this tilak for their beautification. Just as you applied tilak to yourself and your family in Part A, now you're beautifying the divine sages themselves.",

    "B9": "And now the most beautiful, most devotional moment of the entire puja — the Arti, the Vishnu Stuti. Pick up the Ratandeep lamp and incense, hold them in a thali, and wave them gently in front of the Nariwan. You'll recite six magnificent verses, each ending with the same powerful refrain — Oh Keshava, remove the burden of my sins, have mercy on this orphan, and carry me across the ocean of worldly existence. The first verse cries out Victory to Narayana — and it's a genuine prayer from the heart. Each verse deepens the surrender. Really pour your heart into this.",

    "B10": "Prepyun — the offering of food, also called Naivedyam. In Kashmiri tradition, this is almost a full ceremony in itself. First, place the Te'hr — turmeric rice — in front of the deity. Remove about two hundred fifty grams as Chattu, for the sky mothers. Then take seven handfuls as Dev Bhog, one for each Devrishi. Now, everyone present should touch the Prasad plate. If the gathering is large, form a chain. The mantra declares this food should be like amrit, the nectar of immortality. After the main offering, you invoke dozens of deities by name — no god or goddess is forgotten.",

    "C1": "We're now at Kshma Yachna — the closing prayer. Fold your hands and speak from the heart. The mantra says — Oh God, I am always waiting for your mercy, in all states, at all times. I have surrendered to you, please take me under your protection. This is not a formal prayer — it's a genuine, heartfelt plea. Whatever mistakes you might have made during the puja, whatever words you mispronounced — this prayer covers it all. You're asking for forgiveness and protection in one breath.",

    "C2": "And now the grand finale — tying the Nariwan, the sacred Raksha Sutra. This is what the entire puja has been building toward. Take the Nariwan that you've been worshipping — the thread that now carries the living presence of the seven Devreshis — and tie it around the wrist. Right wrist for males, left wrist for females. Keep it on until your next birthday. The mantra is powerful — it references King Bali, the mighty demon king who even the gods feared, yet he was bound by a thread. With that same power, I now bind you — oh protector, do not waver. Then all family members present receive their pre-cut nariwan pieces. The puja is complete, the blessings are sealed, and you carry divine protection for the entire year ahead.",
}

def main():
    # Remove old files to force regeneration with new conversational text
    for f in os.listdir(AUDIO_DIR):
        if f.endswith('.m4a'):
            os.remove(os.path.join(AUDIO_DIR, f))
    print(f"Cleared old narrations. Regenerating {len(NARRATIONS)} files...\n")
    count = 0
    for step_id, text in NARRATIONS.items():
        m4a_path = os.path.join(AUDIO_DIR, f'narr_{step_id}.m4a')
        aiff_path = os.path.join(AUDIO_DIR, f'narr_{step_id}.aiff')
        subprocess.run(['say', '-v', VOICE, '-r', str(RATE), '-o', aiff_path, text], check=True)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', aiff_path, m4a_path], check=True)
        os.remove(aiff_path)
        size_kb = os.path.getsize(m4a_path) / 1024
        print(f"  OK narr_{step_id}.m4a ({size_kb:.0f} KB)")
        count += 1
    print(f"\nDone! {count} narration files in {AUDIO_DIR}")
    total = sum(os.path.getsize(os.path.join(AUDIO_DIR, f)) for f in os.listdir(AUDIO_DIR) if f.endswith('.m4a'))
    print(f"Total size: {total / 1024 / 1024:.1f} MB")

if __name__ == '__main__':
    main()
