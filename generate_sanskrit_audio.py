#!/usr/bin/env python3
"""
Sanskrit TTS Batch Generator for PuzaPaath App
Generates audio for all 50 mantras using the Sanskrit TTS model.
Run on Mac Mini M4 (rakeshganjoo@192.168.86.29)
"""

import torch
import numpy as np
import soundfile as sf
import os
import time
import gc

OUTPUT_DIR = os.path.expanduser("~/sanskrit_tts/puja_audio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# All mantras from pujaData.ts - ID and Devanagari text
MANTRAS = [
    # Part A: Doop Deep Puja
    ("A1", "ॐ शं नो देवीरभिष्टये आपो भवन्तु पीतये। शंयोरभि स्रवन्तु नः।"),
    ("A2", "ॐ तत् सत् ब्रह्म अध्य तावत् तिथौ जन्म दिवसि पूजा कर्म करिष्ये।"),
    ("A3", "ॐ पृथिव्यै त्वया धृता लोका देवि त्वं विष्णुना धृता। त्वं च धारय माम् देवि पवित्रं कुरु चासनम्।"),
    ("A3a", "अस्य श्री आसन शोधन मन्त्रस्य मेरुपृष्ठ ऋषि सूतल छन्दः कूर्मो देवता आसन शोधन विनियोगः"),
    ("A4", "प्रीं पृथिव्यै आधार शक्त्यै समालभनं गन्धो नमः अर्गो नमः पुष्पं नमः"),
    ("A5", "स्कन्द आधार शक्त्यै समालभनं गन्धो नमः अर्गो नमः पुष्पं नमः"),
    ("A6", "ॐ शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्न वदनं ध्यायं सर्व विघ्नोप शान्तये।"),
    ("A7", "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः। गुर्वे नमः परम गुर्वे नमः परमाचार्य नमः। आदि सिद्धिभ्यो नमः।"),
    ("A8", "ॐ अंगुष्ठाभ्यां नमः। न तर्जनीभ्यां नमः। म मध्याभ्यां नमः। शि अनामिकाभ्यां नमः। व कनिष्ठकाभ्यां नमः। य करतलकर पृष्ठाभ्यां नमः।"),
    ("A8a1", "ॐ अंगुष्ठाभ्यां नमः"),
    ("A8a2", "न तर्जनीभ्यां नमः"),
    ("A8a3", "म मध्याभ्यां नमः"),
    ("A8a4", "शि अनामिकाभ्यां नमः"),
    ("A8a5", "व कनिष्ठकाभ्यां नमः"),
    ("A8a6", "य करतलकर पृष्ठाभ्यां नमः"),
    ("A8b1", "ॐ हृदयाये नमः"),
    ("A8b2", "न शिरसे स्वाहा"),
    ("A8b3", "म शिखाये वष्ट"),
    ("A8b4", "शि कवचाय हुम"),
    ("A8b5", "व नेत्रेभ्यां नमः"),
    ("A8b6", "य अस्त्राय फट"),
    ("A9", "अपसर्पन्तु ते भूतो ये भूता भुवि संस्थिताः। ये भूता विघ्न कर्तारस्ते गच्छन्तु शिवाज्ञया।"),
    ("A11", "तीर्थे स्नेयं तीर्थं एव समानं भवति मनः। शंसो आरुषो धूर्तिः प्राणं मर्त्यस्य रक्षणो ब्रह्मणस्पति।"),
    ("A12", "इति मन्त्र स्नानीयं नमः"),
    ("A13", "वसोः पवित्र असि शतधारं वसूनां पवित्र असि सहस्र धारं। अयक्ष्मावः प्रजया प्रिया संसृजामि रायस्पोषेण बहुला भवन्ति।"),
    ("A14a", "परमात्मने पुरुषोत्तमाय पंच भूतात्मकाय विश्वात्मने मन्त्र नाथाय आत्मने नारायणाय आधार शक्त्यै समालभनं गन्धो नमः अर्गो नमः पुष्पं नमः।"),
    ("A14b", "स्व प्रकाशो महा दीपः सर्वतस्तिमिरापहः। प्रसीद मम गोविन्द दीपोयं परिकल्पिता।"),
    ("A14c", "वनस्पति रसो दिव्यो गन्धाध्य गन्धवत् तमः। आधार शक्त्यै सर्व देवानाम् धूपो नमः अर्गो नमः पुष्पं नमः।"),
    ("A14d", "नमो धर्म निधानाय नमः स्वकृतसाक्षणै। नमः प्रतिक्ष देवाय श्री भास्कराय नमः अर्गो नमः पुष्पं नमः गन्धो नमः।"),
    ("A14e", "मन्त्रार्था सफला सन्तु पूर्णः सन्तु नोर्थाः। शत्रूणां बुद्धि नाशोस्तु मित्राणाम् उदयस्तव। आयुर् आरोग्यम् ऐश्वर्यम् एतत् त्रितयम् अस्तुते जीव त्वं शरदः शतम्।"),
    ("A15", "यत्रास्ति माता न पिता न बन्धुः भ्रातापि न यत्र सुहृत् जनश्च न ज्ञायते। यत्र दिनं न रात्रं तत्रात्म दीपं शरणं प्रपह्ये। आत्मने नारायणाय आधार शक्त्यै दीप धूप संकल्पात् सिद्धिर् अस्तु। दीपो नमः धूपो नमः।"),

    # Part B: Madhyam Bhaga
    ("B0", "शान्ताकारं भुजग शयनं पद्मनाभं सुरेशं। विश्वाधारं गगनसदृश्यं मेघवर्णं शुभाङ्गम्। लक्ष्मी कान्तं कमलनयनं योगबिर्ध्यान गम्यं। वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्।"),
    ("B1", "आवाहि सप्त जन्मोत्सव देवताभ्यः अश्वत्थानने बलये व्यासाय हनुमते कृपाचार्याय मार्कण्डेयाय परशुरामाय। भक्तानुग्रह कारक अस्मत् दयानुरोधेन सन्निधानं कुरु प्रभु। अर्चामि नमः।"),
    ("B2", "समवः सृजामि हृदयं संसृष्ट मनोअस्तु वः। संः सृष्टस्तन्वः सन्तु वः सं सृष्टः। प्रणो अस्तु वः संयावः प्रियाः तन्वः। सं प्रियाः हृदयानि वः। आत्मा वो अस्तु सं प्रियः सं प्रियः तन्वोमम्।"),
    ("B3", "सप्त जन्मोत्सव देवताभ्यः गंगादि सर्व तीर्थभ्य आनीतं तोयमुत्तमम्। पाधार्थं सम्प्रदास्यामि गृहन्तु।"),
    ("B4", "गन्ध पुष्प अक्षतैर्युक्तं अर्ध्यं सम्पादितं मया। गृह्णन्तु अर्ध्यं प्रसन्नाश्च भवन्तु मे सर्वदा। सप्त जन्मोत्सव देवताभ्यः अर्ग्यं समर्पयामि नमः।"),
    ("B5", "कर्पूरेण सुघन्धेन वासितं स्वाद शीतलं तोयं आचमनीयार्थं गृहणन्तु सप्त जन्मोत्सव देवताभ्यः।"),
    ("B6", "सप्त जन्मोत्सव देवताभ्यः पञ्चदश स्नानं समर्पयामि नमः।"),
    ("B7", "सप्त जन्मोत्सव देवताभ्यः वस्त्रं समर्पयामि नमः।"),
    ("B8", "सर्वेश्वर जगत् वन्द्य दिव्यासन सुसंस्थित। गन्ध गृहाण देवेश दिव्यगन्धोप शोभितम्। सप्त जन्मोत्सव देवताभ्यः समालभने गन्धो नमः।"),
    ("B9", "जय नारायण जय पुरुषोत्तम जय वामन कंसारे। उद्धर माम सुरेश विनाशिन् पतितोहं संसारे। घोरं हर मम नरक रिपो केशव कल्मषभारं। माम अनुकम्पय दीनम् अनाथं कुरु भव सागर पारम्।"),
    ("B9v1", "जय नारायण जय पुरुषोत्तम जय वामन कंसारे। उद्धर माम सुरेश विनाशिन् पतितोहं संसारे। घोरं हर मम नरक रिपो केशव कल्मषभारं। माम अनुकम्पय दीनम् अनाथं कुरु भव सागर पारम्।"),
    ("B9v2", "जय जय देव जया सुरसूदन जय केशव जय विष्णो। जय लक्ष्मीमुख कमल मधुव्रत जय दशकन्धर जिष्णो। घोरं हर मम।"),
    ("B9v3", "यद्यपि सकलं अहं कलयामि हरे नहि किम् अपि स सत्वम्। तत् अपि न मुञ्चति माम् इदम् अच्युत पुत्रकलत्र ममत्वम्। घोरं हर मम।"),
    ("B9v4", "पुनर् अपि जनन पुनर अपि मरण पुनर अपि गर्भ निवासम्। सोढुम् अलं पुनर अस्मिन् माधव माम् उद्धर निजदासम्। घोरं हर मम।"),
    ("B9v5", "त्वं जननी जनकः प्रभुर अच्युत त्वं सुहृत् कुलमित्रम्। त्वं शरणं शरणा गतवत्सल त्वं भव जलधि वहित्रम्। घोरं हर मम।"),
    ("B9v6", "जानक सुता पति चरण पारायण शंकर मुनिवर गीतं। धारय मनसि कृष्ण पुरुषोत्तम वारय संसृति भीतिम्। घोरं हर मम।"),
    ("B10", "अमृतेश मुद्रया अमृतीकृत्य अमृतम् अस्तु अमृतायतां नैवेद्यम्। सावित्राणि सावित्रस्य देवस्य त्वा सवितुः प्रस्वे शिवनोर् बाहुभ्यां पूष्णो हस्ताभ्याम्।"),

    # Part C: Kshma Yachna
    ("C1", "आपन्नोस्मि शरण्योस्मि सर्वावस्थासु सर्वदा। भगवन् त्वं प्रपन्नोस्मि रक्ष मां शरणागतम्।"),
    ("C2", "येन बद्धो बली राजा दानवेन्द्रो महाबलः। तेन त्वां प्रतिबध्नामि रक्षे मा चल मा चल।"),
]


def load_models():
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import PeftModel

    device = "cpu"
    print(f"Using device: {device}")

    base_model_id = "unsloth/orpheus-3b-0.1-ft"
    adapter_id = "rverma0631/Sanskrit_TTS"

    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(adapter_id)

    print("Loading base model (float16 on CPU)...")
    t0 = time.time()
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
    )
    base_model = base_model.to("cpu")
    print(f"Base model loaded in {time.time()-t0:.1f}s")
    gc.collect()

    print("Loading LoRA adapter...")
    model = PeftModel.from_pretrained(
        base_model, adapter_id, torch_dtype=torch.float16,
        is_trainable=False,
    )

    print("Merging LoRA weights...")
    model = model.merge_and_unload()
    del base_model
    gc.collect()

    model.eval()
    print(f"Model ready in {time.time()-t0:.1f}s")

    print("Loading SNAC audio codec...")
    from snac import SNAC
    snac_model = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").eval().to("cpu")
    print("All models loaded!\n")

    return model, tokenizer, snac_model, device


def redistribute_codes(code_list, snac_model):
    layer_1, layer_2, layer_3 = [], [], []
    for i in range((len(code_list) + 1) // 7):
        layer_1.append(code_list[7*i])
        layer_2.append(code_list[7*i+1] - 4096)
        layer_3.append(code_list[7*i+2] - (2*4096))
        layer_3.append(code_list[7*i+3] - (3*4096))
        layer_2.append(code_list[7*i+4] - (4*4096))
        layer_3.append(code_list[7*i+5] - (5*4096))
        layer_3.append(code_list[7*i+6] - (6*4096))
    codes = [
        torch.tensor(layer_1).unsqueeze(0),
        torch.tensor(layer_2).unsqueeze(0),
        torch.tensor(layer_3).unsqueeze(0),
    ]
    return snac_model.decode(codes)


def generate_speech(text, model, tokenizer, snac_model, device):
    prompt = f"1070: {text}"
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids

    start_token = torch.tensor([[128259]], dtype=torch.int64)
    end_tokens = torch.tensor([[128009, 128260]], dtype=torch.int64)
    modified = torch.cat([start_token, input_ids, end_tokens], dim=1).to(device)
    attention_mask = torch.ones_like(modified)

    with torch.no_grad():
        generated_ids = model.generate(
            input_ids=modified,
            attention_mask=attention_mask,
            max_new_tokens=2048,
            do_sample=True,
            temperature=0.6,
            top_p=0.95,
            repetition_penalty=1.1,
            num_return_sequences=1,
            eos_token_id=128258,
            use_cache=True,
        )

    token_indices = (generated_ids == 128257).nonzero(as_tuple=True)
    if len(token_indices[1]) > 0:
        cropped = generated_ids[:, token_indices[1][-1].item() + 1:]
    else:
        cropped = generated_ids

    row = cropped[0]
    row = row[row != 128258].cpu()
    new_length = (row.size(0) // 7) * 7
    code_list = [int(t) - 128266 for t in row[:new_length]]

    if len(code_list) < 7:
        return None

    audio = redistribute_codes(code_list, snac_model)
    audio_np = audio.detach().squeeze().cpu().numpy()
    return audio_np


def main():
    print("=" * 60)
    print("  PuzaPaath - Sanskrit TTS Batch Generator")
    print(f"  {len(MANTRAS)} mantras to generate")
    print("=" * 60 + "\n")

    model, tokenizer, snac_model, device = load_models()

    success = 0
    failed = []
    total_start = time.time()

    for i, (mantra_id, text) in enumerate(MANTRAS):
        outpath = os.path.join(OUTPUT_DIR, f"{mantra_id}.wav")
        if os.path.exists(outpath):
            print(f"[{i+1}/{len(MANTRAS)}] SKIP {mantra_id} (exists)")
            success += 1
            continue

        print(f"[{i+1}/{len(MANTRAS)}] Generating {mantra_id}... ", end="", flush=True)
        t0 = time.time()

        try:
            audio = generate_speech(text, model, tokenizer, snac_model, device)
            if audio is not None:
                sf.write(outpath, audio, 24000)
                dur = len(audio) / 24000
                elapsed = time.time() - t0
                print(f"OK ({dur:.1f}s audio in {elapsed:.1f}s)")
                success += 1
            else:
                print("FAILED (no codes)")
                failed.append(mantra_id)
        except Exception as e:
            print(f"ERROR: {e}")
            failed.append(mantra_id)

        gc.collect()

    total_elapsed = time.time() - total_start
    print(f"\n{'=' * 60}")
    print(f"  Done: {success}/{len(MANTRAS)} succeeded in {total_elapsed/60:.1f} min")
    if failed:
        print(f"  Failed: {', '.join(failed)}")
    print(f"  Output: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
