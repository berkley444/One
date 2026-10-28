# The Ideal Piano Learning App: Deep Research Report (v2)
*For Jeremy Howe · second, deeper pass completed Oct 25, 2026 (CDT). Focus areas: (a) finger exercises and technique, (b) chords and scales, (c) common musical patterns.*

> **Data rules.** The App Store figures (rating, rating count, price, last update) were pulled live on **Oct 25, 2026** from Apple's iTunes Search/Lookup API (US storefront). Google Play figures were read from the live Play listing pages that same day. The review-theme counts come from **2,411 actual App Store reviews** downloaded via Apple's customer-review RSS feed for 17 apps. Anything I could not confirm is marked **unknown**. The "MIDI / Mic in listing" columns only mean the app's own description mentions that input. They are not a test of how well it works.

---
## 0. What changed from v1
- **Verified app count went from about 15 to 90 iOS apps with live data, plus 13 Google Play listings and 16 web, desktop, or open-source tools, for 119 entries.** v1 had 58 entries with mostly "Unk" ratings.
- I added 2,411 real App Store reviews with complaint-theme counts and quotes for 17 apps.
- I added Piano World forum threads, a Hacker News "Piano Trainer" thread (203 points, 58 comments), more Reddit threads, and YouTube and blog app roundups.
- **Pedagogy is now cited from the source:** Hanon-Faber (Hal Leonard), the Fundamentals of Piano Practice critique of Hanon, the Pianist magazine Hanon critique, the Robert Pace Multi-Key method, A Dozen a Day, Alfred vs. Faber adult courses, Bill Hilton, the Open Studio jazz pathway, and Pianote.
- **Research added:** Jabusch MIDI scale-evenness benchmarks, adult-learner motivation and dropout studies, the FSRS spaced-repetition benchmark, BLE-MIDI latency measurements, and Verovio's Swift package.
- **New direct competitors discovered:** Playy Piano, Chordwise ("Piano chords and scales MIDI"), The Ultimate Piano (web), PianoSkillBoost, Piano Trainer (open source), Chord Nebula, The Hanon Method app, and Artie (AI).
- **Corrections from v1:**
  - Skoove: 4.58★ / 22,307 on the App Store, 4.5★ / 12.4K reviews on Google Play.
  - Playground: 4.77★ / 5,014 on iOS but **3.4★ / 175 on Google Play**.
  - Piano Marvel: 4.67★ / 5,519 on iOS.
  - Pianote price: $30/mo or $279/yr per pianote.com (via Practis).
  - "Piano Maestro" by JoyTunes no longer appears in search. The "Piano Music Maestro" listing is a different app.
  - Chordana Play is 2.74★ / 69. Roland Piano App is 2.32★ / 235.

## 1. Sources opened in this pass
**Data at scale**
- iTunes Search API, run with 43 query terms (piano lessons, learn piano, piano chords, piano scales, hanon, sight reading, music theory, ear training, piano technique, piano teacher, piano practice, chord progressions, jazz piano, keyboard lessons, piano midi, note reading, piano exercises, plus 25 brand-name queries). That gave 1,857 unique apps, filtered to piano-relevant teaching apps.
- The iTunes Lookup API, for the apps added by hand.
- App Store customer-review RSS: up to 3 pages × 50 reviews for each of 17 apps.
- Google Play listing pages for 13 apps.

**Comparison articles and videos**
- Preply: https://preply.com/en/blog/best-piano-learning-apps/
- Practis 2026 retest: https://pract.is/blog/best-piano-learning-apps-adults-2026
- Practis Pianote review: https://pract.is/blog/pianote-review-2026
- Practis, Alfred vs. Faber: https://pract.is/blog/alfred-vs-faber-adult-piano
- Piano Nova: https://piano-nova.com/vs/flowkey-vs-simply-piano
- AppTierList: https://apptierlist.com/best/piano-learning/
- ItalianPiano critique: https://www.italianpiano.com/piano/review-of-simply-piano-app-for-learning-to-play-the-piano/
- Deviant Noise, Melodics review: https://deviantnoise.net/education/piano/melodics-review/
- Digital Trends: https://www.digitaltrends.com/phones/best-piano-learning-apps/
- Jeremy See, one month on apps: https://www.jeremysee.info/post/i-learned-piano-using-music-apps-for-a-month-here-s-what-actually-works
- YouTube roundups (titles and summaries only; transcripts not read): https://www.youtube.com/watch?v=8oONUtDGPCo and https://www.youtube.com/watch?v=eLdCd7zl-NI

**Communities**
- r/piano: https://www.reddit.com/r/piano/comments/1qbxj96/ , https://www.reddit.com/r/piano/comments/1rn130j/ , https://www.reddit.com/r/piano/comments/1h8o9qq/ , https://www.reddit.com/r/piano/comments/1dub8sk/
- r/pianolearning: https://www.reddit.com/r/pianolearning/comments/1s8wsvy/ , https://www.reddit.com/r/pianolearning/comments/1r6eibr/ , https://www.reddit.com/r/pianolearning/comments/11ej031/
- r/musictheory: https://www.reddit.com/r/musictheory/comments/1j068d4/
- r/Melodics: https://www.reddit.com/r/Melodics/comments/15fnd01/
- Piano World: https://forum.pianoworld.com/ubbthreads.php/topics/3247993/ , /3191725/ , /2614446/1.html , /3226829/
- Hacker News: https://news.ycombinator.com/item?id=44467838 (Piano Trainer), https://news.ycombinator.com/item?id=42416258 (Chord Nebula), https://news.ycombinator.com/item?id=41144826 (Hanon Pro)
- Note: Reddit's JSON API blocked direct scripted access from my machine, so I read Reddit threads through search snapshots instead.

**Pedagogy**
- Hanon-Faber preface: https://www.halleonard.com/bin/MiscEducationalKeyboardHanonfaber.pdf
- Fundamentals of Piano Practice, problems with Hanon: https://www.pianofundamentals.com/book/en/1.III.7.8
- Pianist magazine on Hanon: https://www.pianistmagazine.com/blogs/this-is-why-hanon-exercises-are-a-waste-of-time-and-possibly-dangerous/
- The Hanon Debate: https://practisingthepiano.com/the-hanon-debate/
- Pace Multi-Key: https://pacepiano-leerobertsmusic.com/pages/robert-pace_why-multi-key and https://leerobertsmusic.com/pdfs/Transposing.pdf
- A Dozen a Day: https://www.halleonard.com/product/413366/a-dozen-a-day-book-1 and https://archive.org/details/dozendaytechnica00burn
- Faber Adult: https://pianoadventures.com/product/adult-piano-adventures-all-in-one-course-book-1/
- Bill Hilton: https://billspianopages.com/how-to-really
- Open Studio: https://www.openstudiojazz.com/courses/piano-pathway-introductory-jazz-piano/
- Pianist magazine, ballad style: https://www.pianistmagazine.com/blogs/how-to-play-ballad-style-piano/
- MTAC technique toolbox: https://www.mtac.org/wp-content/uploads/2013/05/A-Teaching-Toolbox-for-Optimal-Technique-and-Practice-at-the-Piano.pdf

**Research**
- Interleaving: https://pmc.ncbi.nlm.nih.gov/articles/PMC8476370/
- Spacing in piano: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0182986
- Sleep consolidation: https://doi.org/10.1177/002242940605400203 and https://journals.sagepub.com/doi/10.1177/002242940605400308
- Jabusch scale timing: https://www.immm.hmtm-hannover.de/en/research/previous-research-projects/timing-precision-displayed-by-pianists/ , https://doi.org/10.1002/mds.10671 , https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2013.00134/full
- Adult learners: https://doi.org/10.1177/002242940605400202 , https://journals.sagepub.com/doi/10.1177/0305735610376262 , https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1002&context=musicfacpub , https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02868/full
- FSRS: https://expertium.github.io/Benchmark.html and https://github.com/open-spaced-repetition/srs-benchmark

**Technology**
- Apple QA1831, BLE MIDI: https://developer.apple.com/library/archive/qa/qa1831/_index.html
- BLE MIDI latency: https://music.stackexchange.com/questions/48767/bluetooth-le-midi-latency and https://www.nime.org/proceedings/2019/nime2019_paper006.pdf
- Verovio Swift: https://book.verovio.org/installing-or-building-from-sources/swift-and-objective-c.html
- Basic Pitch: https://github.com/spotify/basic-pitch , https://github.com/zhangyufei49/BasicPitchSwift , https://github.com/spotify/basic-pitch/issues/108
- Mobile-AMT: https://eurasip.org/Proceedings/Eusipco/Eusipco2024/pdfs/0000036.pdf
- Hanon Pro: https://furnacecreek.org/hanon/
- Playy: https://playy.app/
- The Ultimate Piano: https://the-ultimate-piano.com/

**Not reached:** YouTube transcripts, Pianostreet threads, the paywalled full texts of the journal papers (I used abstracts), and Czerny or Suzuki at the source (I used general knowledge there).

## 2. Market at a glance (verified)
- **Popularity is extremely concentrated.**
  - Simply Piano has **859,201** iOS ratings and **994K** Google Play reviews with **50M+** installs. That is nearly 2× the next app (MWM, 442,765).
  - On iOS: MWM "Piano: Keyboard Lessons & Game" 442,765, flowkey 65,849, Yousician Piano 22,807, Skoove 22,307, Hello Piano 12,768, Piano Marvel 5,519, Playground 5,014, Musora 2,985, Artie (new AI app) 2,797.
- **Technique, chord, and scale specialists are tiny.**
  - Piano Companion: 1,328 iOS ratings. Its Android listing ("Piano Chords, Scales Companion", package com.binitex.pianochords; I assume it is the same product but did not confirm the developer match): 23.4K reviews and 1M+ installs.
  - Tenuto: 667. Hanon Pro: **7**. The Hanon Method: 12. Chordwise: 1 on iOS, 1K+ installs on Android.
  - Piano Chords and Scales: 9,285 on iOS, the largest reference-style app.
  - **There's no mass-market winner in your focus areas.** That's the opportunity.
- **Hardware-maker apps are poorly rated:** Roland Piano App 2.32★ (235), Chordana Play 2.74★ (69), ABRSM Piano Scales Trainer 3.4★ (5), Piano Adventures Player 3.6★ (241). Yamaha Smart Pianist is the exception at 4.61★ (823).
- **Headline star ratings hide the pain.** In the most-recent-review samples, the apps averaging 4.6–4.7★ overall scored only **2.9–3.7★** (for example Skoove 2.93, Hello Piano 3.03, Yousician 3.23, Playground 3.25, Simply 3.48). Lifetime averages are inflated by prompted ratings early in a user's life.

## 3. Verified app tables
### 3a. iOS App Store: 90 piano-relevant teaching apps (live, Oct 25, 2026)
Filtering: from 1,857 search results, I kept apps whose name and description involve piano or keyboard *and* teaching. I removed toy virtual keyboards, kids/baby apps, guitar-only apps, sheet-music readers, and DAW tools. Sorted by rating count.

| # | App (US App Store) | Category | Price | Avg ★ | # ratings | Last update | MIDI in listing | Mic in listing | Developer |
|---|---|---|---|---|---|---|---|---|---|
|1|[Simply Piano: Learn Piano Fast](https://apps.apple.com/us/app/id1019442026)|Course / song tutor|Free + IAP/sub|4.68|859,201|2026-10-25|Y|—|Simply Ltd|
|2|[Piano: Keyboard Lessons & Game](https://apps.apple.com/us/app/id1360309966)|Course / song tutor|Free|4.73|442,765|2026-10-20|—|—|MWM|
|3|[Piano app by Yokee](https://apps.apple.com/us/app/id890740165)|Course / song tutor|Free + IAP/sub|4.72|149,487|2024-07-22|—|—|Yokee Music LTD|
|4|[Piano Academy by Yokee Music](https://apps.apple.com/us/app/id1390574671)|Course / song tutor|Free + IAP/sub|4.7|70,197|2024-07-30|Y|Y|Yokee Music LTD|
|5|[flowkey – Learn to Play Piano](https://apps.apple.com/us/app/id1020357408)|Course / song tutor|Free + IAP/sub|4.71|65,849|2026-10-19|Y|Y|flowkey GmbH|
|6|[Piano by Yousician](https://apps.apple.com/us/app/id1469033443)|Course / song tutor|Free + IAP/sub|4.67|22,807|2026-10-13|—|Y|Yousician Ltd|
|7|[Skoove: Learn to Play Piano](https://apps.apple.com/us/app/id1160668178)|Course / song tutor|Free + IAP/sub|4.58|22,307|2026-08-04|Y|Y|Learnfield GmbH|
|8|[Piano Keyboard App: Play Songs](https://apps.apple.com/us/app/id1171389552)|Course / song tutor|Free + IAP/sub|4.46|13,281|2024-07-23|—|—|Yokee Music LTD|
|9|[Hello Piano: Learn How to Play](https://apps.apple.com/us/app/id1429986841)|Course / song tutor|Free + IAP/sub|4.39|12,768|2026-10-20|—|—|Gismart Ltd|
|10|[iReal Pro](https://apps.apple.com/us/app/id298206806)|Chords/scales/theory/technique|$21.99|4.86|11,151|2026-10-17|Y|—|Technimo LLC|
|11|[Piano Chords and Scales](https://apps.apple.com/us/app/id714086944)|Chords/scales/theory/technique|Free|4.78|9,285|2026-10-23|Y|—|Sincere Apps SIA|
|12|[OnlinePianist: Piano Songs](https://apps.apple.com/us/app/id642104967)|Course / song tutor|Free + IAP/sub|4.35|8,968|2026-07-20|—|—|OnlinePianist N.T LTD|
|13|[Perfect Piano - Learn to Play](https://apps.apple.com/us/app/id942937409)|Course / song tutor|Free|4.46|8,569|2026-05-27|Y|—|Revontulet Soft Inc.|
|14|[Tomplay Sheet Music](https://apps.apple.com/us/app/id1054809074)|Course / song tutor|Free + IAP/sub|4.73|7,178|2026-10-22|—|Y|Tombooks Sàrl|
|15|[Tiny Piano - Free Songs to Play and Learn!](https://apps.apple.com/us/app/id477014214)|Course / song tutor|Free|4.6|6,767|2016-04-06|—|—|SquarePoet, Inc.|
|16|[Simple Piano: Play & Learn](https://apps.apple.com/us/app/id1448469792)|Course / song tutor|Free + IAP/sub|4.38|6,392|2025-08-31|—|—|AIHUNTERS, UAB|
|17|[TONALY: Songs, Scales & Theory](https://apps.apple.com/us/app/id1242467844)|Chords/scales/theory/technique|Free|4.77|6,381|2026-10-14|Y|—|Christian Hengst Daniels|
|18|[Piano Marvel - Lessons & Music](https://apps.apple.com/us/app/id1016751878)|Course / song tutor|Free + IAP/sub|4.67|5,519|2026-10-18|Y|Y|Piano Marvel LLC|
|19|[Learn Music Notes Piano](https://apps.apple.com/us/app/id1205662433)|Reading|Free|4.45|5,442|2026-10-07|Y|Y|michal bojanowicz|
|20|[Playground: Fun Piano Lessons](https://apps.apple.com/us/app/id1139846930)|Course / song tutor|Free|4.77|5,014|2026-10-09|—|Y|Playground Sessions, Inc.|
|21|[Piano With Songs- Learn to Play Piano Keyboard A](https://apps.apple.com/us/app/id1217278134)|Course / song tutor|Free + IAP/sub|4.56|4,090|2017-06-26|—|—|Better Day Wireless, Inc.|
|22|[Autochords](https://apps.apple.com/us/app/id788423364)|Chords/scales/theory/technique|Free + IAP/sub|4.74|4,062|2026-06-02|Y|—|Astrocode Pty Ltd|
|23|[Notevision - Sight Reading](https://apps.apple.com/us/app/id874386416)|Reading|Free|4.76|3,290|2026-07-16|Y|Y|Ryan Newsome|
|24|[Musora: The Music Lessons App](https://apps.apple.com/us/app/id1460388277)|Course / song tutor|Free|4.72|2,985|2026-10-21|—|—|Musora Media Inc.|
|25|[Artie: Learn Piano with AI](https://apps.apple.com/us/app/id6746756746)|Course / song tutor|Free|4.67|2,797|2026-10-23|—|Y|Art Master Academy s.r.o.|
|26|[Note Rush: Music Reading Game](https://apps.apple.com/us/app/id1083801827)|Reading|$8.99|4.28|2,430|2023-10-25|Y|Y|Thomas Grayston|
|27|[Chet - Ear Training](https://apps.apple.com/us/app/id1405525467)|Ear training|Free|4.8|2,425|2026-09-28|Y|—|Ensemble Education, Inc.|
|28|[tonestro - Music Lessons](https://apps.apple.com/us/app/id1365630760)|Course / song tutor|Free|4.44|2,343|2026-10-23|—|—|fun.music IT GmbH|
|29|[Music Tutor (Sight-reading)](https://apps.apple.com/us/app/id514363426)|Reading|Free + IAP/sub|4.23|2,237|2025-02-24|Y|—|Bijoy Thangaraj|
|30|[Piano Music Maestro](https://apps.apple.com/us/app/id1446898146)|Course / song tutor|Free + IAP/sub|4.67|2,049|2023-03-07|—|—|Arcadian Software LLC|
|31|[Notes! - Learn To Read Music](https://apps.apple.com/us/app/id423178140)|Reading|$3.99|4.42|1,395|2023-11-05|Y|—|Visions Encoded Inc.|
|32|[Piano Companion: chords,scales](https://apps.apple.com/us/app/id598574333)|Chords/scales/theory/technique|Free|4.78|1,328|2026-10-20|Y|—|Songtive SIA|
|33|[Pickup Music: Music Lessons](https://apps.apple.com/us/app/id6503952069)|Course / song tutor|Free|4.89|1,318|2026-10-21|—|—|Pickup Music Inc.|
|34|[Ear Trainer](https://apps.apple.com/us/app/id358733250)|Ear training|$7.99|4.84|1,204|2021-08-21|—|—|thoor software AB|
|35|[Capo - Learn Music by Ear](https://apps.apple.com/us/app/id887497388)|Ear training|Free + IAP/sub|4.66|1,144|2026-10-22|—|—|SuperMegaUltraGroovy, Inc.|
|36|[Note Flash Music Sight Reading](https://apps.apple.com/us/app/id1285315687)|Reading|Free|3.99|960|2022-08-10|Y|Y|Pranoy Chowdhury|
|37|[Note Trainer Pro](https://apps.apple.com/us/app/id505179836)|Reading|$3.99|4.76|919|2023-09-04|Y|—|thoor software AB|
|38|[Note Trainer Lite](https://apps.apple.com/us/app/id731587156)|Reading|Free|4.62|904|2023-10-16|Y|—|thoor software AB|
|39|[NoteBrainer](https://apps.apple.com/us/app/id310695461)|Reading|Free|4.64|876|2018-07-01|Y|—|James Buchanan|
|40|[Smart Pianist - US](https://apps.apple.com/us/app/id1261382457)|Course / song tutor|Free|4.61|823|2026-09-10|—|—|Yamaha Corporation of Americ|
|41|[Solfa: learn musical notes.](https://apps.apple.com/us/app/id1436741307)|Reading|Free|4.59|806|2024-07-06|—|—|Alexey Ovod|
|42|[Learn Piano and Piano Keyboard](https://apps.apple.com/us/app/id6472706440)|Course / song tutor|Free|4.26|766|2024-05-22|—|—|Thi Lan Anh Tran|
|43|[Piano Way - Learn to Play](https://apps.apple.com/us/app/id1573894643)|Course / song tutor|Free + IAP/sub|4.65|747|2026-02-10|—|—|Gismart Ltd|
|44|[Little Piano - Learn to Play](https://apps.apple.com/us/app/id757811606)|Course / song tutor|Free|4.43|696|2026-09-02|—|—|Piotr Nowacki|
|45|[Tenuto](https://apps.apple.com/us/app/id459313476)|Chords/scales/theory/technique|$4.99|4.74|667|2026-04-28|—|—|musictheory.net, LLC|
|46|[Midi Sheet Music](https://apps.apple.com/us/app/id1330083129)|Course / song tutor|Free + IAP/sub|4.58|640|2018-03-04|Y|—|Madhav Vaidyanathan|
|47|[Bees Keys - First Piano Lesson](https://apps.apple.com/us/app/id1608004053)|Course / song tutor|Free + IAP/sub|4.59|628|2026-08-26|Y|Y|Joshua Callahan|
|48|[Note Quest: Learn Piano Music](https://apps.apple.com/us/app/id1176943393)|Reading|Free + IAP/sub|4.46|620|2026-07-04|Y|—|grace lee|
|49|[Simpia – Learn piano by songs](https://apps.apple.com/us/app/id6444191617)|Course / song tutor|Free + IAP/sub|4.66|565|2026-06-04|Y|—|SMULIE COMPANY LIMITED|
|50|[Notaforte: Sight Reading Tutor](https://apps.apple.com/us/app/id6741677964)|Reading|Free|4.88|508|2026-10-23|—|—|Bravenbird|
|51|[NoteRacer: Piano Sight-Reading](https://apps.apple.com/us/app/id1093955366)|Reading|Free|4.55|496|2026-09-10|—|—|brendan woods|
|52|[Pitch Trainer - Ear Training](https://apps.apple.com/us/app/id6758199236)|Ear training|Free + IAP/sub|4.72|486|2026-10-23|—|—|Ear & Pitch Training Studios|
|53|[Pitch trainer - Harmonize](https://apps.apple.com/us/app/id965614965)|Ear training|Free + IAP/sub|4.44|416|2026-10-24|—|Y|Toshihiko Arai|
|54|[NinGenius Music Ultimate](https://apps.apple.com/us/app/id1452041118)|Chords/scales/theory/technique|$4.99|4.73|413|2020-07-29|—|—|Ningenius Studios LLC|
|55|[Sight Reading Factory](https://apps.apple.com/us/app/id1046058520)|Reading|Free|2.71|391|2026-06-03|—|—|GraceNotes LLC|
|56|[Chord!](https://apps.apple.com/us/app/id606691230)|Chords/scales/theory/technique|$4.99|4.8|383|2022-11-10|—|—|Thomas Grapperon|
|57|[Suggester 2 : Chords & Scales](https://apps.apple.com/us/app/id6448964737)|Chords/scales/theory/technique|Free|4.65|375|2026-10-14|Y|—|Mathieu Routhier|
|58|[Interval Ear Training](https://apps.apple.com/us/app/id361125793)|Ear training|Free + IAP/sub|4.71|364|2024-07-19|Y|—|262Hz LLC|
|59|[Piano For You](https://apps.apple.com/us/app/id1057968515)|Course / song tutor|$4.99|4.65|356|2025-03-03|—|—|Pavel Alekseev|
|60|[Ear Trainer Lite](https://apps.apple.com/us/app/id398326427)|Ear training|Free|4.7|343|2021-08-21|—|—|thoor software AB|
|61|[Falling Note](https://apps.apple.com/us/app/id6760156164)|Reading|Free|4.58|325|2026-10-17|—|Y|Aristotle Theoharris J Farra|
|62|[Scales Pro: Circle of Fifths](https://apps.apple.com/us/app/id1512814631)|Chords/scales/theory/technique|Free|4.52|289|2026-04-06|—|—|Olric Digital|
|63|[Modacity: Pro Music Practice](https://apps.apple.com/us/app/id1351617981)|Practice tool|Free + IAP/sub|4.28|286|2026-09-24|—|—|BotRobot, Inc|
|64|[PIANORUN: Learn Piano Game](https://apps.apple.com/us/app/id6449474440)|Course / song tutor|Free|4.61|267|2025-09-28|—|—|App All Day Pty Ltd|
|65|[MyEarTraining - Ear Trainer](https://apps.apple.com/us/app/id885622580)|Ear training|Free|4.81|253|2025-05-16|—|—|myrApps s.r.o.|
|66|[Music Tutor-How to Play Piano](https://apps.apple.com/us/app/id6472578918)|Reading|Free + IAP/sub|4.73|249|2026-09-27|—|—|新玲 张|
|67|[Ear training: notes and chords](https://apps.apple.com/us/app/id1578165399)|Ear training|Free|4.51|247|2026-09-24|—|—|Alexey Ovod|
|68|[Piano Adventures® Player](https://apps.apple.com/us/app/id991354392)|Course / song tutor|Free + IAP/sub|3.6|241|2026-01-21|Y|Y|Dovetree Productions, Inc.|
|69|[Piano Scales & Chords](https://apps.apple.com/us/app/id577091690)|Chords/scales/theory/technique|Free|4.59|237|2026-10-14|Y|—|Learn To Master Ltd|
|70|[Roland Piano App](https://apps.apple.com/us/app/id1610462043)|Course / song tutor|Free + IAP/sub|2.32|235|2026-04-28|—|—|Roland Corporation|
|71|[Chordology](https://apps.apple.com/us/app/id691133982)|Chords/scales/theory/technique|Free + IAP/sub|4.43|231|2026-09-25|—|—|Greg Raine|
|72|[Piano Partner 2](https://apps.apple.com/us/app/id1092347134)|Course / song tutor|Free|2.16|230|2024-09-30|—|—|Roland Corporation|
|73|[Learn Piano: Fun Real Keyboard](https://apps.apple.com/us/app/id6642697712)|Course / song tutor|Free + IAP/sub|4.75|223|2025-08-20|—|—|CEM SOFTWARE COMPANY LIMITED|
|74|[Learn music theory with Sonid](https://apps.apple.com/us/app/id1490221762)|Chords/scales/theory/technique|Free + IAP/sub|4.66|214|2026-10-23|—|—|Martijn Ensing|
|75|[Piano Melody - Play by Ear](https://apps.apple.com/us/app/id439099401)|Ear training|Free|4.35|210|2026-10-15|—|—|Learn To Master Ltd|
|76|[Piano Companion PRO: chords](https://apps.apple.com/us/app/id586097063)|Chords/scales/theory/technique|$99.99|4.75|207|2026-04-29|Y|—|Songtive SIA|
|77|[Tonic - AR Chord Dictionary](https://apps.apple.com/us/app/id1427039232)|Chords/scales/theory/technique|Free|4.01|204|2018-11-06|—|—|Coda Labs Incorporated|
|78|[Complete Ear Trainer](https://apps.apple.com/us/app/id1012455471)|Ear training|Free + IAP/sub|4.75|200|2026-10-15|—|—|Binary Guilt|
|79|[Teach Note - Sight Reading](https://apps.apple.com/us/app/id1303295012)|Reading|Free|4.74|198|2026-10-08|Y|—|炯龙 吴|
|80|[Piano Teacher-Piano Lessons](https://apps.apple.com/us/app/id1626056563)|Course / song tutor|Free|4.74|192|2026-08-14|—|—|叶 李|
|81|[Piano Ear Training](https://apps.apple.com/us/app/id570615299)|Ear training|Free|4.49|192|2026-10-14|—|—|Learn To Master Ltd|
|82|[Learn Piano – OKTAV](https://apps.apple.com/us/app/id6466106363)|Course / song tutor|Free + IAP/sub|4.61|186|2026-09-21|Y|—|OKTAV GmbH|
|83|[PianoTrax](https://apps.apple.com/us/app/id1356719080)|Course / song tutor|Free + IAP/sub|4.74|178|2026-10-24|—|—|Piano Trax LLC|
|84|[Hoffman App - Daily Practices](https://apps.apple.com/us/app/id1578355464)|Course / song tutor|Free|4.75|40|2026-08-31|—|—|Hoffman Institute Foundation|
|85|[Jazz Piano Voicings: Chords](https://apps.apple.com/us/app/id6755896700)|Chords/scales/theory/technique|Free|4.33|18|2026-10-14|Y|—|District One Mobile, LLC|
|86|[The Hanon Method](https://apps.apple.com/us/app/id6762562536)|Chords/scales/theory/technique|Free + IAP/sub|5|12|2026-10-22|Y|—|Gray Reinhard|
|87|[Hanon Pro](https://apps.apple.com/us/app/id6473125727)|Chords/scales/theory/technique|Free|5|7|2026-01-19|Y|—|Furnace Creek Software LLC|
|88|[Open Studio Jazz](https://apps.apple.com/us/app/id6752910402)|Course / song tutor|Free|4.71|7|2026-09-22|—|—|Open Studio Network LLC|
|89|[ABRSM Piano Scales Trainer](https://apps.apple.com/us/app/id1511139245)|Chords/scales/theory/technique|$4.99|3.4|5|2024-12-20|—|—|The Associated Board of the |
|90|[ChordWise: Piano Chords](https://apps.apple.com/us/app/id6758738394)|Chords/scales/theory/technique|Free + IAP/sub|5|3|2026-09-22|Y|Y|Agile Works B.V.|

### 3b. Google Play (live, Oct 25, 2026)
| App | Play ★ | Reviews | Installs |
|---|---|---|---|
| Simply Piano | 4.6 | 994K | 50M+ |
| Yousician (all instruments, combined app) | 4.4 | 527K | 50M+ |
| Piano – Music Keyboard & Tiles (Gismart, toy/game) | 4.1 | 1.33M | 100M+ |
| Synthesia | 3.9 | 93.5K | 10M+ |
| Perfect Ear | 4.6 | 86.4K | 5M+ |
| Piano Academy (Yokee) | 4.4 | 83.5K | 10M+ |
| flowkey | 4.5 | 46.4K | 5M+ |
| Piano Chords, Scales Companion | 4.7 | 23.4K | 1M+ |
| Skoove | 4.5 | 12.4K | 1M+ |
| OnlinePianist | 3.6 | 10.4K | 1M+ |
| Complete Ear Trainer | 4.5 | 7.2K | 1M+ |
| Musora (Pianote) | 4.1 | 2.16K | 100K+ |
| Piano Chords and Scales (Sincere Apps) | 4.0 | 1.88K | 1M+ |
| Hello Piano | 3.1 | 1.46K | 1M+ |
| Note Rush | 4.2 | 477 | 10K+ |
| Playground | 3.4 | 175 | 50K+ |
| Piano Marvel | 4.6 | unknown | 50K+ |
| Piano Chords Trainer (Chordwise) | 4.4 | unknown | 1K+ |

Not found on Google Play: Hanon Pro (Apple-only), Tenuto (Apple-only), Artie (search returned Simply Piano), and Melodics (no keys app found).

### 3c. Web, desktop, and open source (features verified on official pages or threads; ratings mostly not applicable or unknown)
| Tool | Platform | Price | Input | Relevance to focus areas | Source |
|---|---|---|---|---|---|
| Piano Marvel (web) | Web + iPad | Free tier; $17.99/mo or $129.99/yr | MIDI + acoustic | SASR sight-reading test, method and technique, "ninja" scales | Practis; Piano World |
| Playground Sessions (desktop) | Win/Mac/iPad | Subscription | MIDI | Rookie Bootcamp (93 lessons), Scales and Hanon courses | Piano World 3191725 |
| Pianote / Musora | Web/iOS/Android | $30/mo or $279/yr; 30-day trial | Video only | 10-level method, 950+ play-alongs, delayed teacher video feedback | Practis Pianote review |
| Melodics (Keys) | Win/Mac/iPad | Subscription | MIDI required | Strong timing grading, contemporary chords and grooves; weak theory | melodics.com/midi-keyboard; Deviant Noise |
| Synthesia | Win/Mac/iOS/Android | One-time unlock | MIDI | Falling-notes player; no pedagogy | Play 3.9★ |
| The Ultimate Piano | Browser | Unknown (free to try) | MIDI | **Scale trainer with timing and velocity consistency per note**, chord-inversion training, arpeggio up/down analysis | the-ultimate-piano.com |
| Playy Piano | Mobile (MIDI) | Unknown | BLE/USB MIDI | Custom drills by key, mode, chord type, inversion, tempo, rhythm; no account, no ads | playy.app |
| Chordwise | iOS/Android | iOS paid ("a couple bucks"), Android free base | MIDI | Chord ID, custom scale/chord/inversion drills, progress | r/pianolearning 1r6eibr |
| Piano Trainer (zaneh) | Desktop, open source | Free / paid build | MIDI or computer keyboard | Scales, chords | HN 44467838 |
| Chord Nebula | Browser, open source | Free | MIDI | Chord and progression game | HN 42416258 |
| PianoSkillBoost | Browser | Free | MIDI | Notes, chords, MIDI songs, accuracy tracking | pianoskillboost.com |
| sightread | Browser, open source | Free | MIDI | Sight-reading / falling notes | github.com/sightread/sightread |
| GNU Solfege | Desktop, open source | Free | — | Ear training | gnu.org/software/solfege |
| musictheory.net | Web | Free | — | Theory lessons; companion to Tenuto | musictheory.net |
| Open Studio | Web (+ iOS app 4.71★ / 7) | Subscription | Video | Jazz pathway: shell → rooted/rootless voicings, ii–V–I | openstudiojazz.com |
| Bill Hilton | Book + YouTube | Book / free | — | Lead-sheet comping, blues LH patterns, pop accompaniment | billspianopages.com |

**Total:** 90 iOS + 16 web/desktop/OSS tools = **106 distinct tools**, plus Google Play data for 18 entries, all live or source-verified.

## 4. What 2,411 real reviews say
Method: For each app I pulled up to 150 of the most recent US App Store reviews. Then I searched the 1–2★ reviews for keyword themes. These are keyword counts, not hand-coded, so treat them as approximate. Most-recent samples also skew toward newer users and teenagers.

| App | Reviews read | Avg ★ in sample | 1–2★ reviews | Top 3 complaint themes (count among 1–2★) |
|---|---|---|---|---|
|Skoove|150|2.93|73|price/subscription/billing (31); bugs/crash/sync (11); content depth/repetitive (4)|
|Hello Piano|150|3.03|66|price/subscription/billing (47); recognition/mic/detection (4); MIDI/Bluetooth/connection (4)|
|Yousician|150|3.23|60|price/subscription/billing (21); timing/rhythm feedback (7); recognition/mic/detection (5)|
|OnlinePianist|150|3.18|58|price/subscription/billing (14); bugs/crash/sync (6); recognition/mic/detection (5)|
|Playground|150|3.25|55|bugs/crash/sync (19); price/subscription/billing (14); MIDI/Bluetooth/connection (8)|
|Piano Marvel|150|3.47|53|bugs/crash/sync (19); MIDI/Bluetooth/connection (15); sheet music/reading (10)|
|Musora|150|3.39|52|price/subscription/billing (18); bugs/crash/sync (10); timing/rhythm feedback (5)|
|Simply Piano|150|3.48|47|price/subscription/billing (19); recognition/mic/detection (3); sheet music/reading (2)|
|flowkey|150|3.63|42|price/subscription/billing (14); recognition/mic/detection (6); timing/rhythm feedback (6)|
|Piano Adventures Player|100|3.05|40|price/subscription/billing (10); bugs/crash/sync (9); MIDI/Bluetooth/connection (3)|
|Tonaly|150|3.72|39|chords/scales (16); price/subscription/billing (14); timing/rhythm feedback (3)|
|Piano Academy(Yokee)|150|3.75|37|ads (23); price/subscription/billing (10); content depth/repetitive (1)|
|Artie|105|3.45|36|price/subscription/billing (16); bugs/crash/sync (5); recognition/mic/detection (3)|
|Piano Chords and Scales|150|4.25|21|chords/scales (7); price/subscription/billing (5); bugs/crash/sync (4)|
|Note Rush|150|4.1|18|recognition/mic/detection (6); price/subscription/billing (3); MIDI/Bluetooth/connection (1)|
|Piano Companion|106|4.22|15|chords/scales (5); price/subscription/billing (4); bugs/crash/sync (4)|
|Tenuto|150|4.64|7|price/subscription/billing (1); MIDI/Bluetooth/connection (1); timing/rhythm feedback (1)|

**Theme totals across all 1–2★ reviews (approximate):**
| Theme | Mentions |
|---|---|
| price/subscription/billing | 250 |
| bugs/crash/sync | 98 |
| recognition/mic/detection | 45 |
| MIDI/Bluetooth/connection | 45 |
| timing/rhythm feedback | 45 |
| ads | 43 |
| chords/scales | 37 |
| sheet music/reading | 27 |
| content depth/repetitive | 24 |

**Representative quotes** (verbatim, with the date shown in the review):
- *Hello Piano (Oct 21, 2026):* "It would not let me progress in my individual lesson unless I committed to buying the monthly family plan for @ $35/ month."
- *Hello Piano (Sep 10, 2026):* "The only app on iPad that can't recognize MIDI. It was an instacancel."
- *flowkey (Oct 19, 2026):* "I cancelled my subscription years ago, yet it still attempt to charge me every year."
- *Skoove (Aug 14, 2026):* "…clicking through 75 pop ups, saying no to the premium version 8 times…"
- *Skoove (Sep 7, 2026):* "claimed what i thought was a 'free trial' only to find out I was charged 60 dollars"
- *Piano Marvel (Oct 7, 2026), "Abandonware at this point":* "their app no longer can play any sounds with MIDI… no response from tech support"
- *Yousician (Jun 24, 2026):* "it can listen to literally any other note except for D"
- *Simply Piano (Oct 12, 2026), a 5★ review:* "whenever you play… the note F… it doesn't hear you"
- *Playground (2022):* "about a half second delay between pressing a key on the piano and hearing it through headphones"; "The indicator requires that I press the key before it's directly on the note"
- *Artie (Apr 24, 2026):* "they don't break the songs down into sections"
- *Musora (Aug 21, 2026):* "Subscription trap… trying to navigate past an offer and end up with an unwanted upgrade"
- *Piano Academy / Yokee (Oct 19, 2026):* "You get to practice for five seconds, and then an ad pops up."
- *Tenuto (2019, praise):* "had it for around eight years… I love how customizable it is"; feature request: "PLEASE include voiced chords on grand staff"
- *Tonaly (2021):* "how is this a $7 app and the pentatonic scale isn't even included?!"

**Takeaways:**
1. **Billing and dark patterns are the #1 complaint by far** (about 250 mentions). That's more than double bugs (about 98).
2. Microphone recognition and MIDI connection problems tie at about 45 each.
3. Timing feedback complaints (about 45) are about the app being *wrong*, not too strict.
4. The specialist tools people keep for years (Tenuto, Note Rush, Piano Chords and Scales, Piano Companion) have far fewer 1–2★ reviews: 7, 18, 21, and 15 of 106–150. **Narrow, honest, pay-once tools earn loyalty.**

## 5. Community and forum findings
- **Piano World** users prefer **Piano Marvel for "real" pieces and its sight-reading tool**. They say Playground "maxes out in difficulty much too quickly" and its "Advanced-Hard" pieces are really early intermediate (thread 3247993). They praise Playground's 93-lesson Rookie Bootcamp, its Scales and Hanon courses, and its community, while calling Piano Marvel's UI clunky ("is it still 1998?") (3191725). An older thread says Piano Marvel "doesn't care too much about how long you pressed a key or your timing," while **Musiah** was "much more precise… about how long you press the keys, your timings" (2614446).
- **Hacker News, Piano Trainer thread (July 2025, 203 points):**
  - The top comment says to prioritize the **ear over visuals**: play scales through the circle of fifths at metronome 60, hands together, 2 octaves, in parallel and contrary motion. Practice all four triad qualities with inversions, a few keys every morning, then the ten 4-note chord types, then open position. Learn chords inside a key by **holding the triad in the left hand while playing the matching mode in the right**.
  - A beginner wrote: "I'm never sure which fingers I'm supposed to be using". People recommended rules (thumb on white keys, 4th finger on black) and Alfred's *Complete Book of Scales, Chords, Arpeggios & Cadences*.
  - On movement: "you're not learning notes, you're learning movements… thumb over/under… They're not optional extras."
  - Another dev's planned app "records accuracy and response times per note, and exercises can be directed towards improving weak spots," and readers asked for SRS-style sight reading.
  - Injury concerns (RSI) and Rocksmith-style "fewer notes" simplification were criticized.
- **r/pianolearning, Chordwise launch (Feb 2026):**
  - A user asked to "let the user's keyboard be the main source of sound… MIDI clocks get out of whack when introducing the apps own instrument sounds."
  - An older adult beginner who practices 30 min to 3 h a day asked whether it was "too advanced for me?" **Adults need clear entry points.**
- **Guitarists crossing over** (r/piano, r/pianolearning, r/musictheory):
  - Theory transfers. Piano needs **wrist rotation**, **hand independence**, and **reading**.
  - "Pick a triad, then work your way up and down the whole piano with each of the 3 inversions."
  - Group triads by black-key pattern: all-white, black in the middle, black on the outside.
  - Guitar chords sound "off" on piano because of naive root-position voicings. The fix is LH roots, RH voice-led inversions (G = B D G, C = C E G, D = A D F♯), rhythm, and added 9ths.
  - One user: "piano [is] harder on the wrists than guitar ever was."
- **Reddit, general:** apps are "like Guitar Hero." They allow too many timing mistakes and ignore pedal mush. They work as a supplement next to a method book plus occasional lessons.

## 6. Pedagogy at the source
- **Hanon (1873) and its modern critics.**
  - **Hanon-Faber** (Hal Leonard): "Too often though, these exercises produce tension instead of dexterity… finger strength is subordinate to the coordinated use of fingers, wrist, and arm… Not all of the original Hanon exercises have proven value. These and any potentially harmful exercises have been omitted."
  - **Fundamentals of Piano Practice:** Hanon locks the hands together, so "the better hand cannot practice skills more advanced than the weaker hand." "There is no provision for resting a fatigued hand." Its advice is to practice hands separately.
  - **Pianist magazine:** rote exercises "encourage pianists to keep moving without taking necessary pauses. This leads to tension and injury."
  - **Design implication:** use Hanon *figures* as short, hands-separate, relaxed, rest-enforced warmups with gesture cues, never endurance drills.
- **A Dozen a Day (Burnam):** short groups of 12 pre-practice exercises. Learn 2–3 at a time and add more when mastered. Levels run from Mini to Intermediate, covering finger patterns, scales, arpeggios, chords, staccato, and coordination. This is the model for the warmup block.
- **Robert Pace Multi-Key:** all keys from the start. "Transposition [is] a CORNERSTONE." Same note, rhythm, and finger pattern on a new set of keys. Black keys serve as tactile guide-posts so eyes stay on the page. Daily "Tune Ups" establish the sound of the key. Level 1 already covers all major and minor key signatures, block and broken chords, I–V7, and improvising. This is the model for auto-transposition.
- **Alfred Adult All-in-One vs. Faber Adult Piano Adventures:** Alfred is more chord-first and faster (C and G7 changes early, LH accompaniment). Faber adds more technique, transposition, sight-reading, ear training, and creativity, and later lead-sheet accompaniment.
- **Bill Hilton, *How to Really Play the Piano*:** chords, 12-bar blues, LH blues patterns, and comping from chord symbols. Free YouTube comping playlist. This is the model for the pattern and comping module.
- **Open Studio jazz pathway:** Jump-Start → Jazz Piano for Beginners (shell voicings) → Jazz Chords for Beginners (rooted 5-note, rootless 4-note, LH rootless) → Elements (block, drop-2). This is the model for the voicing ladder.
- **Pianist magazine, ballad style:** learn all diatonic triads in root, 1st, and 2nd inversion hands together. Voice-lead C–G–Am–F keeping the top note nearly still. That's the progression in Journey's "Don't Stop Believin'", which makes it a good hook for Jeremy.
- **MTAC technique toolbox:** keep a wellness journal tracking pain and ease of movement, including computer and phone time. That's relevant for a CAD professional.

## 7. Research (practice science and tech)
- **Interleaving:** for 8-item finger sequences, interleaved practice produced worse training performance but better next-day retention and transfer, even for implicitly learned sequences (Memory & Cognition 2021).
- **Spacing:** no spacing benefit for a 17-note piano sequence at lags of 0–15 min (PLOS One 2017). So the scheduler should space across **days**, not minutes.
- **Sleep:** keyboard sequences improved after sleep on nights 1 and 2 (JRME 2006). Temporal evenness improved 24 h later with no practice (Simmons & Duke 2006).
- **Evenness benchmark:** Jabusch et al., using MIDI, found **professional pianists' timing SD is about 8.1 ms ascending and 8.9 ms descending** for 16th-note scales at 120 BPM. The same method quantifies focal dystonia. Each pianist leaves a stable timing "fingerprint." **So inter-onset SD in ms is a validated, MIDI-measurable technique metric.** The app should show it against a pro reference.
- **Adult learners:** adults are motivated by enjoyment, self-fulfillment, health, and social connection. Dropout is driven by slow perceived progress, unrealistic expectations, and competing obligations. Visible progress and familiar repertoire help retention. (JRME 2006; Taylor 2011 *Psychology of Music*; UNL group-piano study; Frontiers 2019.)
- **FSRS vs. SM-2:** on a 9,999-user benchmark, FSRS-6 log loss was 0.346 vs. 0.513 for Anki SM-2. Use FSRS for recall cards.
- **Bluetooth LE MIDI on iOS:** measured about **22.5 ms vs. about 3.5 ms for USB**. The lower bound comes from the 11.25 ms BLE connection interval. The app must compensate per transport, and timing scores must use device timestamps.
- **Verovio** ships as a Swift Package (iOS 16+), reads MusicXML, and renders to SVG.
- **Mic polyphony:** Basic Pitch has a Core ML model but isn't a streaming model. Mobile-AMT runs online faster than real time on an iPad.

## 8. Synthesis
### What works
- Wait Mode and instant feedback for the first weeks. Hand video (flowkey).
- Bootcamp-style sequenced lessons (Playground).
- Real repertoire plus a sight-reading assessment (Piano Marvel).
- Timing grading users trust (Melodics, Musiah).
- Chord ID and reference depth (Piano Companion).
- Customizable drill generators (Tenuto, Playy, The Ultimate Piano).
- Fitness-style trend charts (Hanon Pro).
- Human teachers and community (Pianote).

### What users hate (ranked by evidence)
1. **Billing dark patterns:** forced plans, hidden auto-renew, 75 pop-ups, charges after cancelling. This is the top 1–2★ theme by a wide margin.
2. **Bugs, crashes, login failures, abandonware:** Piano Marvel iOS MIDI sound, Musora sign-up, Skoove login.
3. **Unreliable mic detection** (specific notes not heard), and **MIDI not recognized or laggy** (Hello Piano on iPad; Playground's half-second headphone delay).
4. **Lenient or wrong grading:** timing slop, ignored rests and pedal, no duration checking.
5. **Falling-notes dependency** that kills sheet-music reading.
6. **Shallow difficulty:** simplified "advanced" pieces, one difficulty per song, no songs broken into sections.
7. **Ads** in mass-market apps.
8. **Non-pianist pedagogy:** no posture or tension guidance, and endurance-style Hanon.

### Gaps nobody fills (confirmed by the 106-tool scan)
- **No single app** combines a technique generator (Pace-style multi-key, Dozen-a-Day sizing, Hanon-Faber safety), chords as motor skills (all qualities × inversions × keys, voice-leading, FSRS recall), and transposable accompaniment patterns over progressions and lead sheets, all **graded by MIDI with Jabusch-style evenness**.
- The closest pieces are spread across niche apps: The Ultimate Piano (web, per-note timing and velocity), Playy / Chordwise (custom chord and inversion drills), Hanon Pro (7 ratings), Piano Companion (reference), Melodics (grooves), and Tenuto (theory). None is native iOS + iPad with a curriculum and an adult focus.
- **No guitarist bridge** (tab → keys, fretboard ↔ keyboard) in any app found.
- **No ethical-pricing leader** among the curriculum apps. Skoove's $299.99 lifetime is the only lifetime option noted.

## 9. The ideal app, "KeyForge" (updated with the new evidence)
1. **Practice loop modeled on teacher practice:**
   - Tune-Up in today's key (Pace)
   - Dozen-a-Day-sized technique set (2–3 new exercises)
   - Scales and chords through the circle of fifths
   - Pattern block
   - Apply in a song
   - Each session is 5–30 min.
2. **Technique, safe by design:**
   - Hanon *figures* in the Hanon-Faber spirit: hands separate first, at a relaxed tempo.
   - Mandatory micro-rests, a gesture cue (drop, roll, wrist rotation), and no endurance streaks.
   - Rhythm variants (dotted, reverse dotted, accents).
   - A pain/tension check-in that feeds a wellness journal.
3. **Evenness metrics with a reference:**
   - Inter-onset SD in ms, velocity SD, legato overlap, and hand-to-hand sync.
   - Shown against "pro reference ~8–9 ms at 120 BPM 16ths" (Jabusch).
   - Per-finger heatmap and weak-spot targeting.
4. **Multi-key from day one:** every exercise auto-transposes. Keys are grouped by black-key topography (all-white, black in the middle, black on the outside), as guitarists in the forums recommend.
5. **Chords as motor skills:**
   - Quality (maj, min, dim, aug, then the ten 7th types) × inversion × key × hand.
   - Up-and-down-the-keyboard inversion runs.
   - Voice-leading drills (top note held still, as in the Pianist ballad method).
   - "LH triad + RH mode" ear-integration drill.
   - FSRS recall cards with response time.
6. **Voicing ladder** (Open Studio order): close triads → LH root + RH inversion (the fix for "guitar chords sound off") → add-9 pop voicings → shells → rooted 5-note → rootless 4-note → drop-2.
7. **Pattern engine:**
   - Progression × LH pattern × RH pattern × key × tempo, with a backing groove.
   - Patterns: block, broken, Alberti, root-5-8, ballad 1-5-8-10, waltz, pop 8ths, blues/boogie LH (Bill Hilton), stride.
   - Progressions: I–V–vi–IV, ii–V–I, 12-bar blues, Andalusian, and others.
   - Lead-sheet comping graded on chord tones and rhythm.
8. **Songs broken into sections** with loop, start-from-bar, and 30–150% tempo. Directly answers Artie and Playground complaints.
9. **Honest grading:** six dimensions, rests and duration checked, pedal mush detected. Wait Mode never counts toward mastery.
10. **Input done right:**
    - USB and BLE MIDI with per-transport latency calibration, using device timestamps.
    - "Use my keyboard's sound" as the **default** for MIDI users (the Chordwise feedback). Local-control guidance.
    - Mic mode states its limits.
11. **Scheduler:** short blocked practice for new material, then interleaved review. Mastery requires two separate days. Tempo ladder.
12. **Adult framing:** goal songs, visible progress charts, clear "start here if…" entry points, no cartoons, and streak freezes.
13. **Guitarist bridge:** paste tab → notes → keys with fingering. Fretboard ↔ keyboard view. Translations of capo and chord shapes.
14. **Reading kept alive:** engraved notation by default, falling notes as fading training wheels, and a Piano Marvel-style sight-reading level estimate (later phase).
15. **Ethical business model:**
    - Free core plus a one-time Pro unlock or a subscription with a lifetime option.
    - Trials need no card. One-tap cancel, with a reminder before renewal.
    - No ads and no curriculum A/B tests on paying users.
    - Offline, no account required.
    - This answers the #1 complaint category directly.
16. **Reliability as a feature:** MIDI hot-plug resilience, crash-free targets, and a public changelog. "Abandonware" is a top complaint for Piano Marvel iOS.

## 10. Top findings (blunt)
1. **Nobody owns your focus areas.** The best technique app (Hanon Pro) has 7 ratings. The best chord reference has 1,328. Simply Piano has 859,201.
2. **Users hate the business model more than the pedagogy.** Billing complaints are about 2.5× bug complaints in 1–2★ reviews.
3. **High star averages are misleading.** Recent-review averages for the big apps are 2.9–3.7★.
4. **MIDI is necessary but not sufficient.** Hello Piano, Piano Marvel, and Playground reviews show broken or laggy MIDI. Robust CoreMIDI plus latency compensation is a competitive edge.
5. **Modern pedagogy rejects endurance Hanon.** Use short, relaxed, hands-separate figures with rests (Hanon-Faber, Fundamentals of Piano Practice).
6. **All keys from day one (Pace) plus circle-of-fifths routines (the HN teacher advice) are low-cost, high-value features** that most apps skip.
7. **There's a validated, measurable technique metric** (inter-onset SD in ms, Jabusch) that no consumer app surfaces against a reference.
8. **The guitarist bridge is still unclaimed.**
