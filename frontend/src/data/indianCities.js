// Comprehensive Indian States → Cities/Towns mapping
// Covers all 28 states, 8 union territories, and major cities/towns in each

const INDIA_STATE_CITIES = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati",
    "Rajahmundry", "Kakinada", "Kadapa", "Anantapur", "Eluru", "Ongole",
    "Vizianagaram", "Tenali", "Proddatur", "Nandyal", "Adoni", "Madanapalle",
    "Machilipatnam", "Chittoor", "Hindupur", "Srikakulam", "Bhimavaram",
    "Mangalagiri", "Dharmavaram", "Gudivada", "Narasaraopet", "Tadipatri",
    "Tadepalligudem", "Chilakaluripet", "Kavali", "Chirala", "Markapur",
    "Palakollu", "Amalapuram", "Bapatla", "Piduguralla", "Vinukonda",
    "Rajam", "Bobbili", "Palasa", "Tuni", "Pithapuram", "Mandapeta"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila",
    "Along", "Tezu", "Roing", "Changlang", "Khonsa", "Namsai", "Daporijo",
    "Anini", "Yingkiong", "Seppa", "Koloriang", "Hawai", "Longding",
    "Aalo", "Basar", "Mechuka", "Tato", "Dirang"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia",
    "Tezpur", "Bongaigaon", "Dhubri", "Karimganj", "North Lakhimpur",
    "Goalpara", "Barpeta", "Sivasagar", "Golaghat", "Nalbari", "Hailakandi",
    "Mangaldoi", "Diphu", "Haflong", "Kokrajhar", "Hojai", "Morigaon",
    "Rangia", "Pathsala", "Lanka", "Dhekiajuli", "Biswanath Chariali",
    "Titabar", "Mariani", "Duliajan", "Digboi", "Namrup", "Doom Dooma"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga",
    "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Bihar Sharif",
    "Saharsa", "Sasaram", "Hajipur", "Dehri", "Siwan", "Motihari",
    "Nawada", "Bettiah", "Samastipur", "Buxar", "Jehanabad", "Aurangabad",
    "Lakhisarai", "Jamui", "Sitamarhi", "Madhubani", "Supaul", "Araria",
    "Kishanganj", "Gopalganj", "Madhepura", "Sheikhpura", "Banka",
    "Nalanda", "Khagaria", "Vaishali", "Saran", "Rohtas"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon",
    "Raigarh", "Jagdalpur", "Ambikapur", "Mahasamund", "Dhamtari",
    "Chirmiri", "Dalli Rajhara", "Dongargarh", "Bhatapara", "Kanker",
    "Kirandul", "Mungeli", "Tilda Newra", "Kawardha", "Janjgir",
    "Champa", "Sakti", "Kondagaon", "Balod", "Baloda Bazar",
    "Bemetara", "Surajpur", "Jashpur Nagar", "Gariaband"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim",
    "Curchorem", "Sanquelim", "Cuncolim", "Quepem", "Canacona", "Sanguem",
    "Pernem", "Mormugao", "Cortalim", "Calangute", "Anjuna", "Candolim",
    "Colva", "Benaulim", "Aldona", "Tivim", "Cansaulim"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Surendranagar",
    "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad",
    "Navsari", "Veraval", "Patan", "Dahod", "Botad", "Godhra",
    "Amreli", "Deesa", "Jetpur", "Gandhidham", "Vapi", "Ankleshwar",
    "Kalol", "Gondal", "Modasa", "Chhota Udaipur", "Keshod",
    "Dholka", "Khambhat", "Bavla", "Himatnagar", "Viramgam",
    "Mundra", "Sanand", "Unjha", "Dwarka", "Somnath"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Sonipat",
    "Hisar", "Rohtak", "Yamunanagar", "Panchkula", "Bhiwani", "Sirsa",
    "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Bahadurgarh",
    "Narnaul", "Mahendragarh", "Hansi", "Fatehabad", "Tohana", "Narwana",
    "Hodal", "Pinjore", "Charkhi Dadri", "Ladwa", "Sohna", "Manesar",
    "Dharuhera", "Barwala", "Jagadhri", "Samalkha", "Assandh"
  ],
  "Himachal Pradesh": [
    "Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Kullu",
    "Bilaspur", "Hamirpur", "Una", "Nahan", "Palampur", "Baddi",
    "Sundernagar", "Paonta Sahib", "Nurpur", "Chamba", "Dalhousie",
    "Nalagarh", "Kangra", "Keylong", "Rampur", "Kasauli", "Baijnath",
    "Kufri", "Kinnaur", "Parwanoo", "Jogindernagar", "Rajgarh",
    "Arki", "Rohru", "Theog", "Recong Peo"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar",
    "Giridih", "Ramgarh", "Dumka", "Phusro", "Medininagar", "Chaibasa",
    "Chatra", "Godda", "Koderma", "Lohardaga", "Pakur", "Sahebganj",
    "Garhwa", "Khunti", "Latehar", "Simdega", "Jamtara", "Seraikela",
    "Gumla", "Adityapur", "Jugsalai", "Hussainabad", "Mihijam",
    "Chandrapura", "Chas", "Mango", "Govindpur"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Dharwad", "Belagavi",
    "Kalaburagi", "Davangere", "Ballari", "Shivamogga", "Tumakuru",
    "Udupi", "Raichur", "Bidar", "Hospet", "Hassan", "Gadag",
    "Mandya", "Chitradurga", "Chikmagalur", "Bagalkot", "Ramanagara",
    "Haveri", "Koppal", "Yadgir", "Chamarajanagar", "Kodagu",
    "Chickballapur", "Kolar", "Karwar", "Bhatkal", "Sirsi",
    "Gokak", "Ilkal", "Athani", "Ranebennur", "Harihar",
    "Nanjangud", "Puttur", "Sulya", "Dandeli"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Palakkad", "Alappuzha", "Kannur", "Kottayam", "Malappuram",
    "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Munnar",
    "Thalassery", "Mattancherry", "Guruvayur", "Kayamkulam", "Changanassery",
    "Attingal", "Nedumangad", "Perinthalmanna", "Thodupuzha",
    "Ponnani", "Tirur", "Vatakara", "Shoranur", "Ottapalam",
    "Cherthala", "Payyanur", "Manjeri", "Nilambur", "Karunagappally",
    "Kalpetta", "Sultan Bathery", "Adoor", "Kodungallur"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar",
    "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli",
    "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Shivpuri",
    "Vidisha", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur",
    "Hoshangabad", "Itarsi", "Sehore", "Betul", "Seoni", "Datia",
    "Nagda", "Dhar", "Shajapur", "Mhow", "Narsinghpur",
    "Tikamgarh", "Raisen", "Panna", "Chhatarpur", "Guna",
    "Ashok Nagar", "Mandla", "Harda", "Barwani", "Jhabua",
    "Balaghat", "Shahdol", "Maihar", "Waidhan", "Umaria"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad",
    "Solapur", "Kolhapur", "Amravati", "Navi Mumbai", "Kalyan",
    "Dombivli", "Vasai-Virar", "Bhiwandi", "Panvel", "Sangli",
    "Malegaon", "Jalgaon", "Akola", "Latur", "Ahmednagar",
    "Dhule", "Ichalkaranji", "Chandrapur", "Parbhani", "Jalna",
    "Bhusawal", "Nanded", "Satara", "Beed", "Yavatmal",
    "Osmanabad", "Wardha", "Gondia", "Ratnagiri", "Sindhudurg",
    "Washim", "Buldhana", "Hingoli", "Gadchiroli", "Baramati",
    "Shirdi", "Alibaug", "Lonavala", "Mahabaleshwar", "Matheran",
    "Ulhasnagar", "Ambarnath", "Badlapur", "Karjat", "Khopoli"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul",
    "Senapati", "Tamenglong", "Chandel", "Jiribam", "Kakching",
    "Moirang", "Nambol", "Moreh", "Lilong", "Mayang Imphal",
    "Wangjing", "Yairipok", "Sugnu", "Noney", "Kangpokpi",
    "Tengnoupal", "Pherzawl", "Kamjong"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar",
    "Baghmara", "Resubelpara", "Mairang", "Nongpoh", "Khliehriat",
    "Mawkyrwat", "Cherrapunji", "Dawki", "Nongthymmai", "Laitlyngkot",
    "Mawsynram", "Umiam", "Byrnihat", "Tikrikilla", "Ampati"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib",
    "Lawngtlai", "Saiha", "Mamit", "Hnahthial", "Saitual",
    "Khawzawl", "Bairabi", "Tlabung", "Thenzawl", "Zawlnuam",
    "N Vanlaiphai", "Darlawn", "Ngopa"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
    "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng",
    "Peren", "Chumukedima", "Pfutsero", "Tseminyu", "Noklak",
    "Shamator", "Niuland", "Jalukie", "Tuli", "Changtongya"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur",
    "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda",
    "Jeypore", "Bargarh", "Angul", "Dhenkanal", "Kendrapara",
    "Jagatsinghpur", "Paradip", "Rayagada", "Koraput", "Sundargarh",
    "Phulbani", "Bhawanipatna", "Keonjhar", "Bolangir", "Nuapada",
    "Jajpur", "Nayagarh", "Sonepur", "Boudh", "Malkangiri",
    "Nabarangpur", "Kandhamal", "Kendujhar", "Kalahandi",
    "Konark", "Gopalpur", "Chandipur", "Barbil", "Talcher"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Firozpur",
    "Abohar", "Muktsar", "Batala", "Barnala", "Kapurthala",
    "Phagwara", "Khanna", "Malerkotla", "Rajpura", "Gurdaspur",
    "Sangrur", "Faridkot", "Nawanshahr", "Mansa", "Ropar",
    "Tarn Taran", "Zira", "Samana", "Sunam", "Nabha",
    "Morinda", "Anandpur Sahib", "Nangal", "Dasuya", "Mukerian",
    "Nakodar", "Sultanpur Lodhi", "Kot Kapura", "Rampura Phul"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer",
    "Bhilwara", "Alwar", "Sikar", "Sri Ganganagar", "Pali",
    "Bharatpur", "Tonk", "Beawar", "Hanumangarh", "Jhunjhunu",
    "Churu", "Chittorgarh", "Nagaur", "Bundi", "Kishangarh",
    "Barmer", "Dhaulpur", "Sawai Madhopur", "Jhalawar", "Banswara",
    "Dungarpur", "Pratapgarh", "Rajsamand", "Dausa", "Karauli",
    "Sirohi", "Jaisalmer", "Baran", "Jalore", "Nathdwara",
    "Deedwana", "Gangapur City", "Makrana", "Sujangarh",
    "Mount Abu", "Pushkar", "Neemrana", "Pilani", "Fatehpur",
    "Nimbahera", "Sanganer", "Phulera", "Chomu", "Hindaun"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo",
    "Singtam", "Jorethang", "Ravangla", "Soreng", "Pakyong",
    "Pelling", "Lachen", "Lachung", "Yuksom", "Geyzing",
    "Naya Bazar", "Chungthang", "Dentam", "Rhenock"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul",
    "Thanjavur", "Tiruppur", "Cuddalore", "Kanchipuram", "Nagercoil",
    "Kumbakonam", "Ramanathapuram", "Karur", "Sivakasi", "Namakkal",
    "Virudhunagar", "Krishnagiri", "Dharmapuri", "Perambalur",
    "Pudukkottai", "Ariyalur", "Nagapattinam", "Mayiladuthurai",
    "Tenkasi", "Tiruvannamalai", "Villupuram", "Ranipet",
    "Hosur", "Ooty", "Kodaikanal", "Mamallapuram", "Rameswaram",
    "Kanyakumari", "Pollachi", "Mettupalayam", "Palani",
    "Ambur", "Vaniyambadi", "Gudiyatham", "Arakkonam",
    "Tiruvallur", "Chengalpattu", "Avadi", "Tambaram"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Mahbubnagar", "Ramagundam", "Nalgonda", "Adilabad", "Suryapet",
    "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Kamareddy",
    "Nirmal", "Bodhan", "Zaheerabad", "Sangareddy", "Medak",
    "Vikarabad", "Narayanpet", "Wanaparthy", "Gadwal", "Kothagudem",
    "Bhongir", "Jangaon", "Medchal", "Shadnagar", "Tandur",
    "Sircilla", "Kodad", "Yellandu", "Bhadrachalam", "Manuguru"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia",
    "Ambassa", "Khowai", "Sabroom", "Sonamura", "Bishalgarh",
    "Teliamura", "Kamalpur", "Melaghar", "Amarpur", "Santirbazar",
    "Kumarghat", "Jogendranagar", "Panisagar"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut",
    "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad",
    "Gorakhpur", "Saharanpur", "Jhansi", "Mathura", "Firozabad",
    "Ayodhya", "Muzaffarnagar", "Shahjahanpur", "Rampur", "Loni",
    "Etawah", "Sambhal", "Hapur", "Budaun", "Fatehpur",
    "Rae Bareli", "Sitapur", "Unnao", "Hardoi", "Sultanpur",
    "Bahraich", "Gonda", "Basti", "Deoria", "Azamgarh",
    "Jaunpur", "Mirzapur", "Sonbhadra", "Bijnor", "Amroha",
    "Mainpuri", "Etah", "Hathras", "Kasganj", "Banda",
    "Hamirpur", "Mahoba", "Lalitpur", "Orai", "Ballia",
    "Mau", "Ghazipur", "Chandauli", "Pratapgarh", "Ambedkar Nagar",
    "Faizabad", "Barabanki", "Lakhimpur Kheri", "Pilibhit",
    "Greater Noida", "Dadri", "Vrindavan", "Chitrakoot"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee",
    "Kashipur", "Rudrapur", "Nainital", "Mussoorie", "Pithoragarh",
    "Almora", "Kotdwar", "Srinagar", "Chamoli", "Tehri",
    "Pauri", "Uttarkashi", "Bageshwar", "Champawat", "Rudraprayag",
    "Jaspur", "Khatima", "Manglaur", "Sitarganj", "Vikasnagar",
    "Doiwala", "Herbertpur", "Laksar", "Tanakpur", "Ramnagar",
    "Bhimtal", "Ranikhet", "Lansdowne", "Gopeshwar", "Joshimath"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
    "Haldia", "Barasat", "Raiganj", "Krishnanagar", "Nabadwip",
    "Medinipur", "Bankura", "Purulia", "Jalpaiguri", "Alipurduar",
    "Cooch Behar", "Balurghat", "Basirhat", "Ranaghat", "Kalyani",
    "Santipur", "Tamluk", "Contai", "Bolpur", "Shantiniketan",
    "Diamond Harbour", "Barrackpore", "Bally", "Chandannagar",
    "Serampore", "Rishra", "Darjeeling", "Kalimpong", "Gangtok",
    "Bongaon", "Islampur", "Jangipur", "Suri", "Rampurhat"
  ],
  "Delhi": [
    "New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh",
    "Connaught Place", "Lajpat Nagar", "Janakpuri", "Pitampura",
    "Rajouri Garden", "Vasant Kunj", "Nehru Place", "Hauz Khas",
    "Defence Colony", "Greater Kailash", "Mehrauli", "Narela",
    "Shahdara", "Preet Vihar", "Mayur Vihar", "Noida Extension",
    "Vikaspuri", "Uttam Nagar", "Palam", "Tilak Nagar",
    "Chandni Chowk", "Paharganj", "Malviya Nagar", "Sarojini Nagar",
    "Green Park", "Chanakyapuri", "R K Puram", "Okhla", "Kalkaji"
  ],
  "Chandigarh": [
    "Chandigarh", "Manimajra", "Mohali", "Panchkula", "Zirakpur"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai",
    "Villianur", "Ariyankuppam", "Bahour", "Nettapakkam"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore",
    "Kathua", "Udhampur", "Poonch", "Rajouri", "Pulwama",
    "Shopian", "Kulgam", "Bandipore", "Ganderbal", "Budgam",
    "Kupwara", "Doda", "Kishtwar", "Ramban", "Reasi",
    "Samba", "Pahalgam", "Gulmarg", "Sonamarg", "Leh"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Diskit", "Hunder", "Panamik",
    "Nyoma", "Hanle", "Zanskar", "Drass", "Turtuk"
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair", "Havelock Island", "Neil Island", "Diglipur",
    "Rangat", "Mayabunder", "Car Nicobar", "Campbell Bay",
    "Little Andaman", "Bamboo Flat", "Garacharma", "Prothrapur"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman", "Diu", "Silvassa", "Amli", "Naroli", "Vapi", "Kachigam"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott",
    "Kalpeni", "Kadmat", "Kiltan", "Chetlat", "Bangaram"
  ]
};

export default INDIA_STATE_CITIES;
