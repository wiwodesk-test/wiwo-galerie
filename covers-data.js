// Magazine Cover Data
// Each cover should have:
// - id: 0-99
// - lowRes: path to low-resolution image for wall texture (e.g., "assets/covers/low/cover_01.jpg")
// - highRes: path to high-resolution image for overlay (e.g., "assets/covers/high/cover_01.jpg")
// - title: Title for the overlay
// - description: Description text for the overlay

const COVERS_DATA = [
    {
        id: 0,
        lowRes: "assets/covers/low/cover_01.jpg",
        highRes: "assets/covers/high/cover_01.jpg",
        title: "Nr. 01, 1926",
        description: "Am 1. Oktober 1946 erscheint die erste Ausgabe der WirtschaftsWoche, damals noch unter dem Namen „Der deutsche Volkswirt“. Aufwendige Titelcover gab es damals noch nicht: Stattdessen wurden die Themen der Woche relativ kryptisch beworben. – Philipp Frohn"
    },
    {
        id: 1,
        lowRes: "assets/covers/low/cover_02.jpg",
        highRes: "assets/covers/high/cover_02.jpg",
        title: "Nr. 25, 1949",
        description: "Nach der Naziherrschaft beschäftigte sich „Der Volkswirt“ vor allem mit den wirtschaftlichen Folgen des Zweiten Weltkrieges. – Philipp Frohn"
    },
    {
        id: 2,
        lowRes: "assets/covers/low/cover_03.jpg",
        highRes: "assets/covers/high/cover_03.jpg",
        title: "Nr. 01, 1959",
        description: "Der Dollar auf dem Prüfstand und wohnungspolitische Fragen: Viele Themen, die uns heute beschäftigen, haben auch die Redakteure im Jahr 1959 bewegt. – Philipp Frohn"
    },
    {
        id: 3,
        lowRes: "assets/covers/low/cover_04.jpg",
        highRes: "assets/covers/high/cover_04.jpg",
        title: "Nr. 24, 1960",
        description: "Konjunktur war schon immer ein Wiwo-Thema: Anfang der 1960er Jahre begann die Debatte, ob die Wirtschaft in den Boomjahren mittlerweile zu heiß gelaufen ist. Bis zur ersten Rezession der Bundesrepublik vergingen aber noch sechs Jahre. – Philipp Frohn"
    },
    {
        id: 4,
        lowRes: "assets/covers/low/cover_05.jpg",
        highRes: "assets/covers/high/cover_05.jpg",
        title: "Nr. 25, 1963",
        description: "Jetzt auch mit Bildcovern! In der Woche vor dem Besuch des damaligen US-Präsidenten John F. Kennedy widmet „Der Volkswirt“ ihm eine Titelseite. Vor dem Rathaus Schöneberg in West-Berlin sprach Kennedy seinen legendären Satz: „Ich bin ein Berliner.“ – Philipp Frohn"
    },
    {
        id: 5,
        lowRes: "assets/covers/low/cover_06.jpg",
        highRes: "assets/covers/high/cover_06.jpg",
        title: "Nr. 43, 1964",
        description: "Lenins Vision war, dass die slawischen Völker mit dem Westen gleichziehen und sich von Agrar- zu Industriegesellschaften entwickeln. Als diese Schwelle erreicht war, wuchsen die Konsum- und Individualisierungswünsche der Menschen. Die ideologischen Parolen der kommunistischen Parteieliten zogen nicht mehr. – Martin Gehlen"
    },
    {
        id: 6,
        lowRes: "assets/covers/low/cover_07.jpg",
        highRes: "assets/covers/high/cover_07.jpg",
        title: "Nr. 28, 1965",
        description: "Im Mai 1965 hatten der Staat Israel und die Bundesrepublik Deutschland erstmals diplomatische Beziehungen aufgenommen. „Der Volkswirt“ ging der Frage nach, ob trotz der Nazi-Gräuel auch reguläre, rein der ökonomischen Vernunft folgende Handelsbeziehungen denkbar sind. – Martin Gehlen"
    },
    {
        id: 7,
        lowRes: "assets/covers/low/cover_08.jpg",
        highRes: "assets/covers/high/cover_08.jpg",
        title: "Nr. 14, 1967",
        description: "„Der Volkswirt“ machte erstmals mit einem farbigen Foto-Cover auf und brachte passend zu diesem Neustart ein großes Portrait über die Lufthansa. Nicht ohne darauf hinzuweisen, dass die Airline nur vier Prozent des Weltluftverkehrs abwickle, obwohl doch die deutsche Wirtschaft elf Prozent Anteil am Welthandel habe. – Martin Gehlen"
    },
    {
        id: 8,
        lowRes: "assets/covers/low/cover_09.jpg",
        highRes: "assets/covers/high/cover_09.jpg",
        title: "Nr. 23, 1967",
        description: "Mit Energiewenden hat Deutschland Erfahrung: Schon in den späten sechziger Jahren schien angesichts deutlich günstigerer Importoptionen ein erster Rückbau der deutschen Steinkohle-Infrastruktur vernünftig. „Der Volkswirt“ hielt die Kosten dafür nach, betonte aber auch: „Keine noch so nachdenklich stimmende Rechnung sollte verhindern, dass nun mit allem Nachdruck der Strukturänderung zu Leibe gerückt wird“. – Martin Gehlen"
    },
    {
        id: 9,
        lowRes: "assets/covers/low/cover_10.jpg",
        highRes: "assets/covers/high/cover_10.jpg",
        title: "Nr. 27, 1967",
        description: "Die Titelstory dieser Volkswirt-Ausgabe macht klar: Der Digitalisierungsrückstand unserer Behörden hat sich schon früh abgezeichnet. Von den mehr als 2.500 damals in der Bundesrepublik installierten Computern standen nur etwa 300 bei öffentlichen Verwaltungen – und das oft vor allem aus Prestige und ohne echte Anbindung. Das Zitat eines damaligen Bundesbeamten kommt einem vertraut vor: „Unser Rückstand in der EDV-Technik ist nicht so schlimm wie unser Rückstand im Denken.“ – Martin Gehlen"
    },
    {
        id: 10,
        lowRes: "assets/covers/low/cover_11.jpg",
        highRes: "assets/covers/high/cover_11.jpg",
        title: "Nr. 35, 1967",
        description: "Die westdeutsche Wirtschaft hatte mehr als ein Jahrzehnt Wachstum hinter sich, dann brach die Konjunktur ein. Der Wirtschaftsjournalist Karl Otto Pöhl analysierte die Gegenmaßnahmen und befand: „Es bedurfte offenbar einer großen Koalition, um ein antizyklisches Finanzprogramm mit entsprechender staatlicher Verschuldung durchzusetzen.“ Die Bundesbank hatte Zweifel an der Expansionspolitik. Pöhl kritisierte sie dafür. Viele Jahre später konnte er es als Präsident des Instituts besser machen. – Martin Gehlen"
    },
    {
        id: 11,
        lowRes: "assets/covers/low/cover_12.jpg",
        highRes: "assets/covers/high/cover_12.jpg",
        title: "Nr. 14, 1968",
        description: "Ein Finanzblatt, das mit einem Pin-up-Girl aufmacht? Ja, es geht um das Jahr 1968. Wer sich von dem Foto lösen konnte, erfuhr im Titelstück von dem natürlich rein sachlichen Themenbezug: Der Reisemarkt hatte das junge Publikum als neue „Käuferreserve“ ausgemacht – für Flugreisen nach Mallorca, kaum teurer als eine Bahnfahrt an die Nordsee.  – Martin Gehlen"
    },
    {
        id: 12,
        lowRes: "assets/covers/low/cover_13.jpg",
        highRes: "assets/covers/high/cover_13.jpg",
        title: "Nr. 15, 1968",
        description: "Mit Anerkennung schaute man im „Volkswirt“ auf die gute Bilanz der italienischen Wirtschaft. Es mischte sich aber auch Argwohn bei: Ohne die „südländische Kunst des Arrangierens“ sei der Erfolg nicht denkbar. Als Kronzeugen zitierte der Autor einen italienischen Rechtsanwalt: Korruption sei nur eine „Begleiterscheinung des Wirtschaftswunders“, die dem Zeitdruck des schnellen Wachstums geschuldet sei. – Martin Gehlen"
    },
    {
        id: 13,
        lowRes: "assets/covers/low/cover_14.jpg",
        highRes: "assets/covers/high/cover_14.jpg",
        title: "Nr. 38, 1968",
        description: "Der Strukturwandel und seine Folgen gaben immer wieder Anlass für Titelgeschichten – auch in Bezug auf das eigene Mediengeschäft. Das öffentlich-rechtliche Fernsehen galt 1969 noch als Newcomer und grub den etablierten Printmedien Werbeerlöse ab. Inzwischen sind wir in der gefühlt fünfundzwanzigsten Staffel dieser Serie: Printmedien sind weit entfernt von „ausgebucht“, aber auch in linearen TV-Sendern lief zuletzt weniger Werbung. Netflix hingegen glänzt mit stetig steigenden Nutzerzahlen und entsprechenden Einkünften. – Martin Gehlen"
    },
    {
        id: 14,
        lowRes: "assets/covers/low/cover_15.jpg",
        highRes: "assets/covers/high/cover_15.jpg",
        title: "Nr. 04, 1968",
        description: "Ein Fahndungsfoto? Zumindest nach einer der beiden Titelfiguren wurde in gewissem Sinne gesucht: Seit Ludwig Erhard 1966 als Bundeskanzler zurückgetreten war, fehlte den Unionsparteien „ein profilierter Repräsentant ihres wirtschaftspolitischen Kurses“, wie „Der Volkswirt“ schrieb. Der Wirtschaftsrat der CDU versuchte, Einfluss auf die Besetzung dieser Leerstelle zu nehmen. Aktuell mahnt der Verein eine „beherzte“ Sozialstaatsreform an: Es sei absurd, dass derzeit „an bestimmten Sprungstellen ein höherer Arbeitslohn nicht in einem höheren Einkommen resultiert“. – Martin Gehlen"
    },
    {
        id: 15,
        lowRes: "assets/covers/low/cover_16.jpg",
        highRes: "assets/covers/high/cover_16.jpg",
        title: "Nr. 28, 1969",
        description: "Das 1-Mark-Auge verdeutlicht die Sorge um steigende Zinsen und deren Auswirkungen auf eine sich wandelnde Weltwirtschaft, die von zahlreichen geldpolitischen Umbrüchen geprägt war. – Valerie Ndoukoun"
    },
    {
        id: 16,
        lowRes: "assets/covers/low/cover_17.jpg",
        highRes: "assets/covers/high/cover_17.jpg",
        title: "Nr. 45, 1969",
        description: "Schon damals stellte sich die Redaktion der WirtschaftsWoche die Frage, wie man beim Investmentsparen mit möglichst wenig Risiko möglichst hohe Gewinne erzielen kann. – Valerie Ndoukoun"
    },
    {
        id: 17,
        lowRes: "assets/covers/low/cover_18.jpg",
        highRes: "assets/covers/high/cover_18.jpg",
        title: "Nr. 50, 1969",
        description: "Das ungewöhnlich provokante Cover leitet eine neue WiWo-Serie über das Geschäft mit dem Sex in Literatur, Mode und Werbung ein – eine Folge der sexuellen Revolution und Liberalisierung der 1960er und 1970 Jahre. – Valerie Ndoukoun"
    },
    {
        id: 18,
        lowRes: "assets/covers/low/cover_19.jpg",
        highRes: "assets/covers/high/cover_19.jpg",
        title: "Nr. 40, 1970",
        description: "Weniger als ein Jahr nach Brandts Amtsantritt und seinem Aufruf „Mehr Demokratie wagen“ wächst die Skepsis gegenüber dem sozialliberalen Wohlstands- und Reformversprochen der noch jungen Regierung. In den folgenden Jahren sollte sich ein schleichendes Ende des deutschen Wirtschaftswunders abzeichen. – Valerie Ndoukoun"
    },
    {
        id: 19,
        lowRes: "assets/covers/low/cover_20.jpg",
        highRes: "assets/covers/high/cover_20.jpg",
        title: "Nr. 46, 1970",
        description: "Dieses Versprechen machten die Sozialdemokraten in Hessen und Bayern damals ihren Wählern. Heute wissen wir, dass sie es nicht halten konnten: Noch immer gibt es große Unterschiede in der Behandlung von Privat- und Kassenpatienten. – Valerie Ndoukoun"
    },
    {
        id: 20,
        lowRes: "assets/covers/low/cover_21.jpg",
        highRes: "assets/covers/high/cover_21.jpg",
        title: "Nr. 26, 1973",
        description: "Die starke Inflation im Zuge der ersten Ölkrise veranlasste viele Menschen dazu, Sachwerte wie Gold zu horten. Heute, mehr als 50 Jahre später, ist Gold aufgrund der unsicheren Weltlage erneut in aller Munde – und stieg im Januar 2026 erstmals über 5.000 Dollar. – Valerie Ndoukoun"
    },
    {
        id: 21,
        lowRes: "assets/covers/low/cover_22.jpg",
        highRes: "assets/covers/high/cover_22.jpg",
        title: "Nr. 35, 1973",
        description: "Nicht nur mit Pferdewetten lässt sich viel Geld machen - Vorrausetzung natürlich man hat Glück - , sondern auch mit den Nachfahren erfolgreicher Hengste. Der deutsche Fuchshengst Lombard war in Anfang der 1970er Jahre auf seinem Karrierehöhepunkt, war sogar bei Olympia. Doch ab 1973 lief es für ihn nicht mehr und so verbrachte er seinen Ruhestand auf drei Gestüten in England als Deckhengst. Seine Nachfahren sind auch heute noch auf den Rennbahnen Europas unterwegs. – Anna Lauterjung"
    },
    {
        id: 22,
        lowRes: "assets/covers/low/cover_23.jpg",
        highRes: "assets/covers/high/cover_23.jpg",
        title: "Nr. 17, 1974",
        description: "Länger läuft es nicht so gut: Ölkrise und Rezession machen dem Arbeitsmarkt zu schaffen. Doch im Sommer 1974 erreicht die Arbeitslosigkeit neue Ausmaße. Es werden über eine halbe Million Arbeitslose gemeldet. Viele von ihnen frische Schulabsolventen, die keinen Ausbildungsplatz finden können. Ein Wendepunkt für die Politik: Erstmalig wurde Jugendarbeitslosigkeit als Herausforderung anerkannt. – Anna Lauterjung"
    },
    {
        id: 23,
        lowRes: "assets/covers/low/cover_24.jpg",
        highRes: "assets/covers/high/cover_24.jpg",
        title: "Nr. 22, 1974",
        description: "Die Geschichte von der Finanzflucht in die Schweiz ist dank des dortigem Bankgeheimnis fast genauso alt wie die WirtschaftsWoche. In den 1970er Jahren brachten immer wieder Diktatoren verschiedener Regime ihr Geld dort unter. So  auch der Äthiopische Kaiser Haile Selassie, der angeblich ein massives Vermögen in der Schweiz lagern soll. 1974 wird er bei einem Putsch gestürzt, was die Diskussion rund um die Finanzoase wieder aufkochte. – Anna Lauterjung"
    },
    {
        id: 24,
        lowRes: "assets/covers/low/cover_25.jpg",
        highRes: "assets/covers/high/cover_25.jpg",
        title: "Nr. 15, 1975",
        description: "In 1975 beobachtet die WirtschaftsWoche ein Phänomen: Immer mehr Top-Mananger, die neben ihren Positionen im Bundestag in Bonn saßen, wird es zu viel. Zu hoch sei die Belastung gewesen, heißt es. Die Folge: Sie geben ihre Management-Position auf und werden zu Vollzeitpolitikern. Einem möglichen Interessenskonflikt wird übrigens nur ein Absatz der Geschichte gewidmet.  – Anna Lauterjung"
    },
    {
        id: 25,
        lowRes: "assets/covers/low/cover_26.jpg",
        highRes: "assets/covers/high/cover_26.jpg",
        title: "Nr. 02, 1976",
        description: "Obwohl die WirtschaftsWoche so heißt, wie sie heißt, hat sie sich nicht immer nur mit harten Wirtschaftsthemen beschäftigt. Ein Beispiel dafür ist dieses Cover aus der Mitte der 1970er-Jahre. Damals finden im Februar 1976 die Olympischen Winterspiele in Österreich statt und ganz Deutschland ist im Ski-Fieber. Und natürlich muss die WirtschaftsWoche darüber berichten, wo man die besten Pisten findet. – Anna Lauterjung"
    },
    {
        id: 26,
        lowRes: "assets/covers/low/cover_27.jpg",
        highRes: "assets/covers/high/cover_27.jpg",
        title: "Nr. 25, 1977",
        description: "Heute sind sie aus keinem Büro mehr wegzudenken, damals wurden sie „Arbeitsplatzkiller“ genannt: 1977 kommt der erste Heimcomputer auf den Markt. Wie bei vielen neuen Technologien befürchtet man, dass Arbeitsplätze dadurch abgebaut werden. Ganz pessimistische Stimmen gehen sogar von einem Verlust von 80 Prozent über die nächsten 20 Jahre aus. So schlimm kam es dann doch nicht: zwar wurden Arbeitsplätze abgebaut, doch es kamen pro Jahr mehr dazu als verloren gingen. – Anna Lauterjung"
    },
    {
        id: 27,
        lowRes: "assets/covers/low/cover_28.jpg",
        highRes: "assets/covers/high/cover_28.jpg",
        title: "Nr. 33, 1977",
        description: "Aufrüstung: Das Thema der 1970er-Jahre - auch für die Wirtschaft. Gerade hatte die Sowjetunion ihre auf Westeuropa gerichteten atomaren Mittelstreckenrakten durch modere SS-20 Raketen ersetzt. Die Bundesregierung unter Helmut Schmidt sieht nun das strategische Gleichgewicht in Europa in Gefahr und fordert Gegenmaßnahmen. Gleichzeitig überlegt die US-Regierung die erste Neutronenwaffe einzuführen - eine der schlimmsten Waffen überhaupt. Hochenergetische Neutronenstrahlung zerstört alles Leben auf qualvollste Weise, lässt dabei aber Gebäude und Infrastruktur verschont.  – Anna Lauterjung"
    },
    {
        id: 28,
        lowRes: "assets/covers/low/cover_29.jpg",
        highRes: "assets/covers/high/cover_29.jpg",
        title: "Nr. 27, 1977",
        description: "In den 1970er Jahren ist der deutsche Fotografie-Markt ein Wachstumsmarkt. Die wohl bekanntesten Marken unter ihnen sind Agfa und Leica. Wichtiger als die Geschichte war für viele WirtschaftsWoche-Leser wohl der Fotografie-Wettbewerb. Für das beste Foto mit dem Oberthema Geld gab es eine Reise mit einem Luxus-Liner der Holland-Amerika-Linie in die Karibik. Der Wert damals: 5000 Mark. Für den zweiten Platz gab es eine neue Spiegelreflexkamera, den dritten eine Kompakt-Kamera. – Anna Lauterjung"
    },
    {
        id: 29,
        lowRes: "assets/covers/low/cover_30.jpg",
        highRes: "assets/covers/high/cover_30.jpg",
        title: "Nr. 43, 1977",
        description: "1977 ließ das Thema Automatisierung und Computerisierung die WirtschaftsWoche nicht mehr los. Doch anders als in der produzierenden Wirtschaft hat der Computer noch keinen Einzug ins Büro - jedenfalls noch nicht. Die WirtschaftsWoche stellt die Neuheiten vor, unter anderem den bereits zehn Jahre alten vollintegrierten Bürostuhl von Colani, der auch auf dem Titel zu sehen ist. Der soll, so lautet die Prognose, bis 2000 zur Selbstverständlichkeit geworden sein. Und, besitzt Ihr Büro einen dieser Stühle? – Anna Lauterjung"
    },
    {
        id: 30,
        lowRes: "assets/covers/low/cover_31.jpg",
        highRes: "assets/covers/high/cover_31.jpg",
        title: "Nr. 05, 1979",
        description: "1979: Den deutschen Industriekonzernen geht es gut. Sogar sehr gut: Ihre Barreserven sind so groß wie noch nie nach dem Krieg. Doch investiert wird nicht - und wenn nur im Ausland. Immer mehr Unternehmen, darunter auch Siemens, Bayer oder BASF stecken ihr Geld lieber in Standorte und Firmen in den USA. In Deutschland würden die neuen Anlagen, die man mit der Investition finanzieren würde, nicht mehr die gewünschte Rendite bringen.  – Anna Lauterjung"
    },
    {
        id: 31,
        lowRes: "assets/covers/low/cover_32.jpg",
        highRes: "assets/covers/high/cover_32.jpg",
        title: "Nr. 14, 1979",
        description: "Aufrecht und unbeweglich steht die steinerne Büste Ludwig Erhards, Zigarre rauchend, da. Hinter ihm Karl Marx, noch erkennbar, aber in Einzelteile zerfallen, sein Werk „Das Kapital“ halb verschüttet. Das Cover ist der Vorbote des wirtschaftspolitischen Paradigmenwechsels der 1980er-Jahre: weg von der Illusion staatlich garantierter Stabilität, hin zu sozialer Marktwirtschaft, Eigenverantwortung und Wettbewerb. – Antonella Corrado"
    },
    {
        id: 32,
        lowRes: "assets/covers/low/cover_33.jpg",
        highRes: "assets/covers/high/cover_33.jpg",
        title: "Nr. 34, 1980",
        description: "Das goldene Ei markiert den Beginn einer neuen Ära: Weg von Ideologie, hin zu Fortschritt und Innovation. Im Zentrum steht die Frage: Wer bringt nach der zweiten Ölkrise das nächste wirtschaftliche Wunder hervor - und wer vermag es, dieses auszubrüten? – Antonella Corrado"
    },
    {
        id: 33,
        lowRes: "assets/covers/low/cover_34.jpg",
        highRes: "assets/covers/high/cover_34.jpg",
        title: "Nr. 46, 1980",
        description: "Ein Mann im dunklen Anzug. Das Gesicht bewusst abgeschnitten. Stars and Stripes deuten auf die US-Präsidentschaftswahl hin, die Ronald Reagan wenige Tage zuvor gewonnen hatte. Das Cover markiert einen historischen Wendepunkt und die Hoffnung auf ein neues starkes Amerika. – Antonella Corrado"
    },
    {
        id: 34,
        lowRes: "assets/covers/low/cover_35.jpg",
        highRes: "assets/covers/high/cover_35.jpg",
        title: "Nr. 11, 1981",
        description: "1981 befindet sich die Bundesrepublik und ihre Wirtschaft in einem hochkomplexen Übergang. Nach den Folgen der Ölkrise, rutscht sie 1981 in eine Rezession. Der seinerzeit relativ neue Kubik-Würfel, versinnbildlicht die Systemlogik und Ordnung des Staates, der zunächst strukturiert wirkt. Bei näherem Hinsehen sieht man jedoch einzelne Steine, die aus der Reihe tanzen oder auf unerforschtem Terrain liegen, für das es noch keine erprobten Lösungen gibt.  – Antonella Corrado"
    },
    {
        id: 35,
        lowRes: "assets/covers/low/cover_36.jpg",
        highRes: "assets/covers/high/cover_36.jpg",
        title: "Nr. 07, 1983",
        description: "Es sind knapp 3 Wochen vor der Bundestagswahl. Die Regierung Helmut Kohls soll durch die vorgezogenen Neuwahlen legitimiert oder beendet werden. Die Bundesrepublik befindet sich in der schwersten Nachkriegsrezession. Der grüne Flicken auf dem goldenen Streifen der deutschen Flagge symbolisiert den erstmaligen Einzug der Grünen in den deutschen Bundestag.    – Antonella Corrado"
    },
    {
        id: 36,
        lowRes: "assets/covers/low/cover_37.jpg",
        highRes: "assets/covers/high/cover_37.jpg",
        title: "Nr. 15, 1983",
        description: "Zwei Roboterarme kämpfen mit Säbel und Degen an der Doppelfront der Bundesrepublik 1983. Innenpolitisch: Finanz- und Strukturprobleme, der Mittelstand steht unter Druck und belastet den Sozialstaat. Außenpolitisch: Europa befindet sich im Wettbewerb, der Technologiewettlauf beginnt, Automatisierung wird eine neue Machtquelle. – Antonella Corrado"
    },
    {
        id: 37,
        lowRes: "assets/covers/low/cover_38.jpg",
        highRes: "assets/covers/high/cover_38.jpg",
        title: "Nr. 13, 1984",
        description: "Für Stahlkonzerne lief es während des Wirtschaftswunders prächtig. Doch in den 1970ern und 1980er-Jahren gibt es zu viel Stahl auf dem Markt, der Preis fällt und die Branche rutscht in eine tiefe Krise. Thyssen hatte sich kurz davor stark diversifiziert und fährt genau zu dem Zeitpunkt hohe Verluste ein. Die Rettung: Ein Kurswechsel und die Stabiliserung in den 1990er Jahren, die Ende der 1990er Jahre in der Fusion von Thyssen und Krupp zu Thyssenkrupp endet. – Anna Lauterjung"
    },
    {
        id: 38,
        lowRes: "assets/covers/low/cover_39.jpg",
        highRes: "assets/covers/high/cover_39.jpg",
        title: "Nr. 46, 1984",
        description: "Die Exportnation Deutschland schickt ihre Manager ins Ausland, um dort die Produkte zu verkaufen. Doch der Erfolg bleibt dabei aus. Zu müde, zu unflexibel, zu ungeduldig. Damit das ganze nicht nur ein teurer Spaß für die Unternehmen bleibt, hat die WirtschaftsWoche natürlich die besten Tipps. Ein kleiner Fakt am Rande: Die Ausgabe hatte damals über 160 Seiten - und das war keine Seltenheit.  – Anna Lauterjung"
    },
    {
        id: 39,
        lowRes: "assets/covers/low/cover_40.jpg",
        highRes: "assets/covers/high/cover_40.jpg",
        title: "Nr. 13, 1985",
        description: "Von der Stahlkrise betroffen ist auch der Stahlkonzern Klöckner & Co. Das Unternehmen befindet sich in einer kritischen Finanzlage, die Fusion mit Krupp scheiterte und ein gepatzes Rohöl-Termingeschäft hilft auch nicht. Schlussendlich macht die Deutsche Bank ein Übernahmeangebot und wandelt das Utnernehmen in eine Aktiengesellschaft um. – Anna Lauterjung"
    },
    {
        id: 40,
        lowRes: "assets/covers/low/cover_41.jpg",
        highRes: "assets/covers/high/cover_41.jpg",
        title: "Nr. 39, 1985",
        description: "Mitte der 1980er Jahre macht der US-Kongress, sowohl Demokraten als auch Republikaner, gegen Importe von ausländischen Gütern mobil: „Seid gute Amerikaner, kauft amerikanisch“. Auch Tochterunternehmen, die im Besitz von ausländischen Müttern sind, werden boykottiert. Insgesamt werden hunderte von Gesetzen entworfen, darunter auch eins, bei dem amerikanische Airlines nur kalifornischen Wein am Bord servieren dürfen. Der einzige, der noch dagegen hält, ist der damalige US-Präsident Ronald Regan. – Anna Lauterjung"
    },
    {
        id: 41,
        lowRes: "assets/covers/low/cover_42.jpg",
        highRes: "assets/covers/high/cover_42.jpg",
        title: "Nr. 02, 1986",
        description: "1986: Seit vier Jahren ist Helmut Kohl nun Kanzler. Und im kommenden Jahr muss er sich wieder zur Wahl stellen - eine Wahl, die dank glänzender Wirtschaftsprognosen für viele Unionspolitiker und scheinbar auch für die WirtschaftsWoche-Autoren bereits gewonnen ist. Die einzigen Schwachstellen, scheinen nach der Fusion der beiden streitenen Landesverbände Rheinland und Westfalen-Lippe, Rentner und Landwirte zu sein. Kein Wunder daher, was auf dem nächsten Titelbild in dieser Gallerie zu sehen ist. – Anna Lauterjung"
    },
    {
        id: 42,
        lowRes: "assets/covers/low/cover_43.jpg",
        highRes: "assets/covers/high/cover_43.jpg",
        title: "Nr. 06, 1986",
        description: "Sie kennen doch sicher das berühmte Zitat: „Die Rente ist sicher“. Das stammt aus dem Jahr 1986, genauso wie diese Aufgabe. Denn damals ahnte man schon, dass das Rentensystem in seiner Form mit der steigenden Lebenerwartung und der sinkenen Geburtsrate langfristig nicht finanzierbar ist. Das Zitat kommt aus einer Kampagne des damaligen Bundesarbeitsministers, der hoffte, so Vertrauen in das System zu erhöhen.  – Anna Lauterjung"
    },
    {
        id: 43,
        lowRes: "assets/covers/low/cover_44.jpg",
        highRes: "assets/covers/high/cover_44.jpg",
        title: "Nr. 36, 1989",
        description: "Ende der 1980er-Jahre übernimmt die Daimler-Benz-Tochter DASA nach einem Hin und Her mit dem Kartellamt den deutschen Luft- und Raumfahrtkonzern Messerschmitt-Bölkow-Blohm, kurz MBB. Die DASA wird zum größten Rüstungsexporteur Deutschlands. Nur knapp über zehn Jahre später fusioniert die DASA mit einem französischen  und einem spanischen Unternehmen und wird die European Aeronautic Defence and Space Company - heute Airbus. – Anna Lauterjung"
    },
    {
        id: 44,
        lowRes: "assets/covers/low/cover_45.jpg",
        highRes: "assets/covers/high/cover_45.jpg",
        title: "Nr. 31, 1990",
        description: "Nach dem Krieg erlebt Japan, wie Deutschland, einen massiven Wirtschaftsaufschwung. Ende der 1980er Jahre ist das Land zu einer der führenden Wirtschaftsmächte aufgestiegen und gilt sogar als Motor der weltwirtschaftlichen Konjunktur. Doch der Boom kommt nicht ohne Risiko für Anleger. Es bildet sich eine riesige Aktien- und Immobilienblase - die 1991 dann entgülig platzt. Noch immer erholt sich die japanische Wirtschaft und erreicht seitdem nicht mehr die selben hohen Wachstumsraten wie noch vor den 1990er Jahren. – Anna Lauterjung"
    },
    {
        id: 45,
        lowRes: "assets/covers/low/cover_46.jpg",
        highRes: "assets/covers/high/cover_46.jpg",
        title: "Nr. 34, 1990",
        description: "Zwei Ölkrisen hat die WirtschaftsWoche Anfang der 1990er Jahre bereits durchmacht. Dann besetzten im August 1990 irakische Truppen Kuwait, der zweite Golfkrieg bricht aus - und der Ölpreis schnellt in die Höhe. Glücklicherweise aber nur für eine kurze Zeit. Zu einer dritten Ölkrise kommt es nicht und im Frühjahr 1991 endet der Golfkieg mit der Befreiung Kuwaits. – Anna Lauterjung"
    },
    {
        id: 46,
        lowRes: "assets/covers/low/cover_47.jpg",
        highRes: "assets/covers/high/cover_47.jpg",
        title: "Nr. 50, 1991",
        description: "Der europäische Kontinent ist Anfang der 1990er Jahre im Umbruch. Das Ende der Sowjetunion, das Eskalieren des Balkankonflikts, die Wiedervereinigung Deutschlands. Mitten darin, im Dezember 1991 legen die Staats- und Regierungschefs der Europäischen Gemeinschaft (EG) den Grundstein für die EU und den Euro. Damit beginnt auch eine Zeit der EU- und Eurokritik der WirtschaftsWoche, von der erst 2015 mit einer Imagekampagne offiziell Abstand genommen wurde. – Anna Lauterjung"
    },
    {
        id: 47,
        lowRes: "assets/covers/low/cover_48.jpg",
        highRes: "assets/covers/high/cover_48.jpg",
        title: "Nr. 05, 1992",
        description: "1992 wagt IBM die Revolution. Anstatt im Büro am Hauptsitz in Stuttgart zu arbeiten, dürfen 160 Mitarbeiter im Rahmen einer sogenannten außerbetrieblichen Arbeitsstätte von Zuhause aus arbeiten, darunter auch viele Führungskräfte. Mit großen Erfolg. Insgesamt ist die Nachfrage nach dem Modell in der Belegschaft um ein zehnfaches höher als das Angebot. Auch Experten sehen nur positive Effekte für Firmen und Mitarbeiter. – Anna Lauterjung"
    },
    {
        id: 48,
        lowRes: "assets/covers/low/cover_49.jpg",
        highRes: "assets/covers/high/cover_49.jpg",
        title: "Nr. 45, 1993",
        description: "Was, die Jugend von heute will nur noch vier Tage die Woche arbeiten? Das geht doch nicht! Dabei ist die Idee der verkürzten Woche nicht neu. Bereits 1993 will Volkswagen die Vier-Tage-Woche einführen, andere Branchen haben sie sogar bereits. Die WirtschaftsWoche berichtet über die vielen Vorteile: Mitarbeiter sind flexibler in ihrer Freizeitgestaltung, sind weniger krank und auch noch produktiver.  – Anna Lauterjung"
    },
    {
        id: 49,
        lowRes: "assets/covers/low/cover_50.jpg",
        highRes: "assets/covers/high/cover_50.jpg",
        title: "Nr. 06, 1994",
        description: "Was würden Sie sagen, ist wichtig für ihre Karriere? Ihre Leistung, Ihre Erfahrung, Ihr Charisma? Sicherlich, doch es gibt auch einen anderen großen Faktor: das Aussehen. Studien zeigen, dass attraktive Menschen mehr verdienen, schneller aufsteigen und werden im gesamten Berufsleben besser bewertet - bei gleicher Leistung. Der sogenannte Halo-Effekt. Andersherum gibt es für weniger attraktive Personen übrigens den Horn-Effekt, bei dem unattraktive Menschen deutlich schlechter bewertet werden bei gleicher Leistung und es dadurch im Job schwieriger haben als attraktive Menschen.  – Anna Lauterjung"
    },
    {
        id: 50,
        lowRes: "assets/covers/low/cover_51.jpg",
        highRes: "assets/covers/high/cover_51.jpg",
        title: "Nr. 28, 1994",
        description: "Mitte der 1990er Jahre sind 3,7 Millionen Menschen als arbeitslos registriert. Unter ihnen auch immer mehr Führungskräfte. Und für sie, für die es immer nur aufwärts ging, ist der Fall oft tiefer als bei anderen. Sie entwickeln Depressionen und physische Krankheiten, geraten mitunter sogar in existentielle Krisen. Auch sind sie hilflos bei der Jobsuche danach - „fast wie Analphabeten“, sagt der Experte in der WirtschaftsWoche.  – Anna Lauterjung"
    },
    {
        id: 51,
        lowRes: "assets/covers/low/cover_52.jpg",
        highRes: "assets/covers/high/cover_52.jpg",
        title: "Nr. 28, 1996",
        description: "1996 richtet sich der Blick auf China als aufstrebende ökonomische Kraft – noch vorsichtig, aber mit dem klaren Gespür, dass sich die globale Machtbalance unter Führung von Jiang Zemin dauerhaft verschieben wird. – Tiffany Peach"
    },
    {
        id: 52,
        lowRes: "assets/covers/low/cover_53.jpg",
        highRes: "assets/covers/high/cover_53.jpg",
        title: "Nr. 40, 1996",
        description: "Schon 1996 wird der Regelungsdschungel als Standortproblem inszeniert – eine Klage, die bis heute vertraut klingt und zeigt, wie hartnäckig das Thema geblieben ist. – Tiffany Peach"
    },
    {
        id: 53,
        lowRes: "assets/covers/low/cover_54.jpg",
        highRes: "assets/covers/high/cover_54.jpg",
        title: "Nr. 08, 1997",
        description: "1997 gerät der Arbeitsmarkt ins Wanken – schwaches Wachstum, Unternehmensumbauten und Globalisierungsdruck lassen die Sorge um Jobverlust zum dominierenden Thema werden. – Tiffany Peach"
    },
    {
        id: 54,
        lowRes: "assets/covers/low/cover_55.jpg",
        highRes: "assets/covers/high/cover_55.jpg",
        title: "Nr. 35, 1997",
        description: "Die Börse als Einladung und Warnung zugleich – Strategien für eine wackelige Marktphase im Vorfeld des Börsenbooms. – Tiffany Peach"
    },
    {
        id: 55,
        lowRes: "assets/covers/low/cover_56.jpg",
        highRes: "assets/covers/high/cover_56.jpg",
        title: "Nr. 10, 1998",
        description: "Grün vor Neid: Das Cover inszeniert Neid als vermeintlich deutsche Charaktereigenschaft – zugespitzt als gesellschaftliche Stimmung, die Aufstieg, Reichtum und Erfolg misstrauisch beäugt. – Tiffany Peach"
    },
    {
        id: 56,
        lowRes: "assets/covers/low/cover_57.jpg",
        highRes: "assets/covers/high/cover_57.jpg",
        title: "Nr. 30, 1998",
        description: "Das Mobiltelefon wird 1998 vom Technikobjekt zum Konsumgut, Tarife und Geräte versprechen Freiheit, Erreichbarkeit und den Eintritt in eine neue, mobile Alltagsökonomie. – Tiffany Peach"
    },
    {
        id: 57,
        lowRes: "assets/covers/low/cover_58.jpg",
        highRes: "assets/covers/high/cover_58.jpg",
        title: "Nr. 31, 1999",
        description: "Frauen und Geldanlage als Gegenentwurf zum damaligen Anlegerklischee: Das Cover inszeniert finanzielle Stärke und Selbstbestimmung – bewusst stilisiert, provokant und ganz im Ton der späten 1990er Jahre. – Tiffany Peach"
    },
    {
        id: 58,
        lowRes: "assets/covers/low/cover_59.jpg",
        highRes: "assets/covers/high/cover_59.jpg",
        title: "Nr. 38, 2000",
        description: "Ein rapider Ölpreisanstieg nach jahrelang niedrigen Preisen machte Energie um die Jahrtausendwende wieder zum zentralen ökonomischen Risikofaktor – und warf die Frage auf, wer von teurer Energie profitiert und wer die Kosten trägt. – Tiffany Peach"
    },
    {
        id: 59,
        lowRes: "assets/covers/low/cover_60.jpg",
        highRes: "assets/covers/high/cover_60.jpg",
        title: "Nr. 18, 2000",
        description: "Online-Shopping als Verlockung und Zukunftsversprechen, gezeichnet im Überschwang der Dotcom-Ära. – Tiffany Peach"
    },
    {
        id: 60,
        lowRes: "assets/covers/low/cover_61.jpg",
        highRes: "assets/covers/high/cover_61.jpg",
        title: "Nr. 17, 2001",
        description: "Sparwelle: Ein Cover das mit demonstrativer Leere die beginnende Sparwelle nach dem Platzen der Dotcom-Blase sichtbar machte. – Tiffany Peach"
    },
    {
        id: 61,
        lowRes: "assets/covers/low/cover_62.jpg",
        highRes: "assets/covers/high/cover_62.jpg",
        title: "Nr. 38, 2001",
        description: "Wenige Tage nach den Terroranschlägen vom 11. September kann die Welt das Ausmaß der Gewalt noch immer nicht begreifen – ebenso schwierig ist es die wirtschaftlichen Folgen einzuordnen.  – Tiffany Peach"
    },
    {
        id: 62,
        lowRes: "assets/covers/low/cover_63.jpg",
        highRes: "assets/covers/high/cover_63.jpg",
        title: "Nr. 51, 2002",
        description: "Ein provokantes WiWo-Cover aus dem Jahr 2002, das vor dem Hintergrund der EU-Beitrittsdebatte um die Türkei die Frage nach Europas politischen und kulturellen Grenzen zuspitzte. – Tiffany Peach"
    },
    {
        id: 63,
        lowRes: "assets/covers/low/cover_64.jpg",
        highRes: "assets/covers/high/cover_64.jpg",
        title: "Nr. 10, 2003",
        description: "Was gibt es da zu lachen? Über die produktive Kraft des Humors – als Ventil, Denköffner und Überlebensstrategie in wirtschaftlich und gesellschaftlich schweren Zeiten. – Tiffany Peach"
    },
    {
        id: 64,
        lowRes: "assets/covers/low/cover_65.jpg",
        highRes: "assets/covers/high/cover_65.jpg",
        title: "Nr. 14, 2003",
        description: "Was 2003 noch als provokante Analyse erschien, liest sich heute fast wie eine Dauerfrage der Weltwirtschaft – angesichts florierender Rüstungsaktien und einer Konjunktur im permanenten Krisenmodus. – Tiffany Peach"
    },
    {
        id: 65,
        lowRes: "assets/covers/low/cover_66.jpg",
        highRes: "assets/covers/high/cover_66.jpg",
        title: "Nr. 32, 2004",
        description: "Ritt ohne Risiko: Dieses WiWo-Cover griff die aufgeheizte Debatte um Spitzengehälter auf und kam zu dem nüchternen Befund, dass die Vergütung im internationalen Vergleich vielleicht nicht zu hoch, aber auffällig risikoarm strukturiert ist – mit viel Fixgehalt und wenig echter Leistungsbindung. – Tiffany Peach"
    },
    {
        id: 66,
        lowRes: "assets/covers/low/cover_67.jpg",
        highRes: "assets/covers/high/cover_67.jpg",
        title: "Nr. 42, 2005",
        description: "Angela Merkel stehen die Haare zu Berge: 2011 verpasste der Autovermieter Sixt ihr in einer Cabrio-Werbekampagne demonstrativ eine Sturmfrisur. Merkel nahm das gelassen – und die WirtschaftsWoche machte daraus ein Cover über ihre „Politik des Weiter so“. Gute Fahrt! – Tiffany Peach"
    },
    {
        id: 67,
        lowRes: "assets/covers/low/cover_68.jpg",
        highRes: "assets/covers/high/cover_68.jpg",
        title: "Nr. 21, 2006",
        description: "Cover gingen bei der WirtschaftsWoche auch extravagant. – Celine Imensek"
    },
    {
        id: 68,
        lowRes: "assets/covers/low/cover_69.jpg",
        highRes: "assets/covers/high/cover_69.jpg",
        title: "Nr. 29, 2006",
        description: "Effizienz wird zur neuen Ingenieurdisziplin, nicht unbedingt aus Idealismus, sondern aus ökonomischem Druck. Der Hybridantrieb folgt als pragmatische Antwort auf teure Energie und verschärften Wettbewerb. – Tiffany Peach"
    },
    {
        id: 69,
        lowRes: "assets/covers/low/cover_70.jpg",
        highRes: "assets/covers/high/cover_70.jpg",
        title: "Nr. 41, 2007",
        description: "Energie und Lebensmittel waren 2007 die größten Preistreiber, die Teuerungsrate lag bei 2,4 Prozent. So hoch wie im September 2025. – Celine Imensek"
    },
    {
        id: 70,
        lowRes: "assets/covers/low/cover_71.jpg",
        highRes: "assets/covers/high/cover_71.jpg",
        title: "Nr. 23, 2007",
        description: "Microsoft kann sexy. Und kann heute auch KI. In der Liste der wertvollsten Unternehmen steht Microsoft vor Apple und Google-Mutter Alphabet. – Celine Imensek"
    },
    {
        id: 71,
        lowRes: "assets/covers/low/cover_72.jpg",
        highRes: "assets/covers/high/cover_72.jpg",
        title: "Nr. 10, 2008",
        description: "Diese Frage auf dem WiWo-Cover ein halbes Jahr vor der Bankenkrise musste wohl mit „Ja“ beantwortet werden. – Celine Imensek"
    },
    {
        id: 72,
        lowRes: "assets/covers/low/cover_73.jpg",
        highRes: "assets/covers/high/cover_73.jpg",
        title: "Nr. 39, 2008",
        description: "September 2008. Eine Woche nach dem Crash von Lehman Brothers geben WiWo-Redakteure für Geld, das mehr als auf der Kippe steht.  – Celine Imensek"
    },
    {
        id: 73,
        lowRes: "assets/covers/low/cover_74.jpg",
        highRes: "assets/covers/high/cover_74.jpg",
        title: "Nr. 04, 2009",
        description: "Jahre vor dem Abgas-Skandal war eines der größten Probleme des Volkswagen-Konzerns: Verkauft sich unser Golf? Keine Sorge: Heute ist das Modell das meistverkaufte in Deutschland. – Celine Imensek"
    },
    {
        id: 74,
        lowRes: "assets/covers/low/cover_75.jpg",
        highRes: "assets/covers/high/cover_75.jpg",
        title: "Nr. 31, 2009",
        description: "Die Riester-Rente lohnt sich nicht. Eine Wahrheit, die über 15 Jahre später mit einer Reform ausgebessert werden soll. – Celine Imensek"
    },
    {
        id: 75,
        lowRes: "assets/covers/low/cover_76.jpg",
        highRes: "assets/covers/high/cover_76.jpg",
        title: "Nr. 06, 2010",
        description: "Rankings gehören schon lange zur WirtschaftsWoche dazu. 2010 sucht die WirtschaftsWoche die besten Anlageprofis, die in den Crashjahren deutlich weniger verloren haben als ihre Kollegen. Natürlich gibt's auch Tipps für die Leser: Alle drei Gewinner setzen in irgendeiner Form auf Gold und gehen davon aus, dass der Preis langfristig auf über 3000 Euro die Unze steigen wird. Ein guter Rat: heute liegt die Unze Gold sogar bei über 4000 Euro. – Anna Lauterjung"
    },
    {
        id: 76,
        lowRes: "assets/covers/low/cover_77.jpg",
        highRes: "assets/covers/high/cover_77.jpg",
        title: "Nr. 30, 2011",
        description: "Die eine Supermacht wird für tot erklärt, eine andere betritt die Bühne. Amazon setzt damals schon fast 50 Milliarden Dollar um. – Celine Imensek"
    },
    {
        id: 77,
        lowRes: "assets/covers/low/cover_78.jpg",
        highRes: "assets/covers/high/cover_78.jpg",
        title: "Nr. 43, 2012",
        description: "Schon 2012 war klar, dass weder die Rieser- noch die gesetzliche Rente die beste Form der Altersvorsorge ist. – Celine Imensek"
    },
    {
        id: 78,
        lowRes: "assets/covers/low/cover_79.jpg",
        highRes: "assets/covers/high/cover_79.jpg",
        title: "Nr. 41, 2013",
        description: "2013 erlebte der Goldpreis einen deutlichen Rückgang. Wer damals in das Edelmetall investierte, kann sich heute über einen Wertzuwachs von über 200 Prozent freuen. – Celine Imensek"
    },
    {
        id: 79,
        lowRes: "assets/covers/low/cover_80.jpg",
        highRes: "assets/covers/high/cover_80.jpg",
        title: "Nr. 47, 2014",
        description: "Auch heute noch sind die Deutschen konservative Sparer. Etwa 37 Prozent der Vermögen liegt auf Sparkonten. – Celine Imensek"
    },
    {
        id: 80,
        lowRes: "assets/covers/low/cover_81.jpg",
        highRes: "assets/covers/high/cover_81.jpg",
        title: "Nr. 34, 2015",
        description: "Diesel für 1,16 Euro den Liter. Das waren noch Preise damals zur Ölkrise 2015. – Celine Imensek"
    },
    {
        id: 81,
        lowRes: "assets/covers/low/cover_82.jpg",
        highRes: "assets/covers/high/cover_82.jpg",
        title: "Nr. 27, 2016",
        description: "Vor zehn Jahren galt das E-Auto als großes neues Ding. International ist das sicher so gekommen. In Deutschland geht der Ausbau eher schleppend voran.  – Celine Imensek"
    },
    {
        id: 82,
        lowRes: "assets/covers/low/cover_83.jpg",
        highRes: "assets/covers/high/cover_83.jpg",
        title: "Nr. 35, 2016",
        description: "Bei der WirtschaftsWoche haben wir uns auch an wilderen Covern versucht. So viel Blingbling gibt es heute nicht mehr. – Celine Imensek"
    },
    {
        id: 83,
        lowRes: "assets/covers/low/cover_84.jpg",
        highRes: "assets/covers/high/cover_84.jpg",
        title: "Nr. 15, 2017",
        description: "TikTok, Temu, BYD. Sie alle spielten 2017 noch keine Rolle oder mussten erst noch gegründet werden. Druck aus China hat Deutschland aber schon damals zu spüren bekommen.  – Celine Imensek"
    },
    {
        id: 84,
        lowRes: "assets/covers/low/cover_85.jpg",
        highRes: "assets/covers/high/cover_85.jpg",
        title: "Nr. 40, 2017",
        description: "Oliver Bäte war Chef der Allianz, Matthias Müller Vorstandsvorsitzender von Volkswagen und Angela Merkel Bundeskanzlerin. Und bei der WiWo stellte man sich die Frage: Wie kommt man da hin? – Celine Imensek"
    },
    {
        id: 85,
        lowRes: "assets/covers/low/cover_86.jpg",
        highRes: "assets/covers/high/cover_86.jpg",
        title: "Nr. 11, 2018",
        description: "Im Oktober 2025 trat Evelyn Palla ihre Rolle als neue Bahnchefin an. Ob sie es 2026 schafft, die Änderungen umzusetzen, die die Wiwo-Autoren schon 2018 forderten? – Celine Imensek"
    },
    {
        id: 86,
        lowRes: "assets/covers/low/cover_87.jpg",
        highRes: "assets/covers/high/cover_87.jpg",
        title: "Nr. 08, 2019",
        description: "Die Vormacht Chinas, Trumps Zölle und ein deutscher Sozialstaat, der zum Problem wird. Kommt uns doch bekannt vor... – Celine Imensek"
    },
    {
        id: 87,
        lowRes: "assets/covers/low/cover_88.jpg",
        highRes: "assets/covers/high/cover_88.jpg",
        title: "Nr. 28, 2019",
        description: "Vor sieben Jahren machte die Lebensmittelmafia mit gepunchtem Olivenöl und Gammelfleisch so viel Umsatz wie nie.  – Celine Imensek"
    },
    {
        id: 88,
        lowRes: "assets/covers/low/cover_89.jpg",
        highRes: "assets/covers/high/cover_89.jpg",
        title: "Nr. 22, 2020",
        description: "Mitten in der Pandemie galt Home Office als neuer Standard. Die Vermutung: Das hält auch über die Corona-Krise hinaus an. Mittlerweile hat man sich in vielen Firmen auf Hybrid-Regelungen geeinigt. – Celine Imensek"
    },
    {
        id: 89,
        lowRes: "assets/covers/low/cover_90.jpg",
        highRes: "assets/covers/high/cover_90.jpg",
        title: "Nr. 40, 2020",
        description: "Wenige Monate nach dem Fall von Wirecard zeigten WiWo-Autoren, welchen Wert Shortseller für die Börse haben.  – Celine Imensek"
    },
    {
        id: 90,
        lowRes: "assets/covers/low/cover_91.jpg",
        highRes: "assets/covers/high/cover_91.jpg",
        title: "Nr. 10, 2021",
        description: "Ikeas Strategie ist aufgegangen. Mittlerweile hat sich der schwedische Möbelhändler beim Umsatz wieder vor XXXLutz geschoben. Online dominiert aktuell aber ein anderer Konkurrent: Amazon.  – Celine Imensek"
    },
    {
        id: 91,
        lowRes: "assets/covers/low/cover_92.jpg",
        highRes: "assets/covers/high/cover_92.jpg",
        title: "Nr. 04, 2022",
        description: "Einen Monat vor dem russischen Einmarsch in die Ukraine stellten sich WiWo-Autoren bereits die Frage: Was macht Deutschland im Fall der Fälle wegen seiner Abhängigkeit von Russland? – Celine Imensek"
    },
    {
        id: 92,
        lowRes: "assets/covers/low/cover_93.jpg",
        highRes: "assets/covers/high/cover_93.jpg",
        title: "Nr. 45, 2022",
        description: "„Der Verbrenner ist nicht tot, bloß weil die Politik ihn beerdigt.“ Mit dem Aus des Verbrenner-Aus' wird die EU der Devise unserer Autoren zwei Jahre später folgen. – Celine Imensek"
    },
    {
        id: 93,
        lowRes: "assets/covers/low/cover_94.jpg",
        highRes: "assets/covers/high/cover_94.jpg",
        title: "Nr. 40, 2023",
        description: "Nicht nur im Job ist manchmal ein Neuanfang nötig. Auch die WirtschaftsWoche muss sich von Zeit zu Zeit erneuern und zeigt sich jetzt im aktuellen Layout. – Celine Imensek"
    },
    {
        id: 94,
        lowRes: "assets/covers/low/cover_95.jpg",
        highRes: "assets/covers/high/cover_95.jpg",
        title: "Nr. 42, 2023",
        description: "Schon vor Donald Trumps Wiederwahl galt für die Ölkonzerne die Devise: „Drill, baby, drill“. Was für Trump jedoch eine kleinere Rolle spielen dürfte, Wiwo-Autoren hier aber aufgeschlüsselt haben: Der verteufelte Rostoff könnte Teil der Klima-Lösung sein. – Celine Imensek"
    },
    {
        id: 95,
        lowRes: "assets/covers/low/cover_96.jpg",
        highRes: "assets/covers/high/cover_96.jpg",
        title: "Nr. 14, 2024",
        description: "Dank der liberalen Wirtschaftsreformen von Ex-Premierminister Shinzō Abe schwang sich Japan zu neuer Größe auf. Ob der Aufschwung unter der nationalistischen Sanae Takaichi weitergeht, wird sich nach und nach zeigen. – Celine Imensek"
    },
    {
        id: 96,
        lowRes: "assets/covers/low/cover_97.jpg",
        highRes: "assets/covers/high/cover_97.jpg",
        title: "Nr. 09, 2024",
        description: "Themen, die bleiben. Schon vor zwei Jahren kämpfte die Chemieindustrie damit, dass sie sich verändern muss. Die anhaltend schwache Wirtschaft gereicht ihr dabei auch heute nicht zum Vorteil. – Celine Imensek"
    },
    {
        id: 97,
        lowRes: "assets/covers/low/cover_98.jpg",
        highRes: "assets/covers/high/cover_98.jpg",
        title: "Nr. 28, 2025",
        description: "Erkennen Sie die beiden Männer? Elon Musk ist als großer Aufräumer Donald Trumps gestartet. Seine Anti-Bürokratie-Behörde DOGE gibt es heute nicht mehr. – Celine Imensek"
    },
    {
        id: 98,
        lowRes: "assets/covers/low/cover_99.jpg",
        highRes: "assets/covers/high/cover_99.jpg",
        title: "Nr. 30, 2025",
        description: "Bei allen Negativmeldungen bedarf es auch positiven Nachrichten. Die deutsche Autoindustrie macht es den Konkurrenten aus China eben doch noch bei manchen Themen vor. – Celine Imensek"
    },
    {
        id: 99,
        lowRes: "assets/covers/low/cover_100.jpg",
        highRes: "assets/covers/high/cover_100.jpg",
        title: "Nr. 04, 2025",
        description: "Sie wollen wissen, wie Sie Ihre Kraftreserve nicht von beiden Seiten anbrennen? Der Wiwo-Titel zum Thema Resilienz ist heute noch immer aktuell und in diesen Zeiten sicher einen Lesemoment wert. – Celine Imensek"
    }
];

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COVERS_DATA;
}

