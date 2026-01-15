// Location data for Country -> State -> City cascading dropdowns

export interface Country {
    name: string;
    code: string;
    states: State[];
}

export interface State {
    name: string;
    code: string;
    cities: string[];
}

export const countries: Country[] = [
    {
        name: "United States",
        code: "US",
        states: [
            {
                name: "California",
                code: "CA",
                cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Oakland", "Fresno", "Long Beach", "Irvine", "Palo Alto", "Mountain View", "Sunnyvale"]
            },
            {
                name: "New York",
                code: "NY",
                cities: ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers", "Brooklyn", "Queens", "Manhattan"]
            },
            {
                name: "Texas",
                code: "TX",
                cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Plano", "Irving"]
            },
            {
                name: "Florida",
                code: "FL",
                cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Fort Lauderdale", "Tallahassee", "Gainesville"]
            },
            {
                name: "Washington",
                code: "WA",
                cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Redmond", "Kirkland", "Olympia"]
            },
            {
                name: "Massachusetts",
                code: "MA",
                cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Somerville", "Newton"]
            },
            {
                name: "Illinois",
                code: "IL",
                cities: ["Chicago", "Aurora", "Naperville", "Rockford", "Joliet", "Springfield", "Evanston"]
            },
            {
                name: "Pennsylvania",
                code: "PA",
                cities: ["Philadelphia", "Pittsburgh", "Allentown", "Reading", "Erie", "Scranton", "Harrisburg"]
            },
            {
                name: "Georgia",
                code: "GA",
                cities: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Macon", "Marietta"]
            },
            {
                name: "Colorado",
                code: "CO",
                cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder", "Lakewood", "Thornton"]
            },
            {
                name: "Arizona",
                code: "AZ",
                cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Gilbert", "Tempe"]
            },
            {
                name: "North Carolina",
                code: "NC",
                cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary"]
            },
            {
                name: "New Jersey",
                code: "NJ",
                cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Princeton", "Hoboken"]
            },
            {
                name: "Virginia",
                code: "VA",
                cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington", "Newport News", "Alexandria"]
            },
            {
                name: "Michigan",
                code: "MI",
                cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Dearborn"]
            },
            {
                name: "Ohio",
                code: "OH",
                cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Canton"]
            },
            {
                name: "Indiana",
                code: "IN",
                cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Bloomington", "Fishers"]
            },
            {
                name: "Tennessee",
                code: "TN",
                cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin"]
            },
            {
                name: "Oregon",
                code: "OR",
                cities: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend"]
            },
            {
                name: "Maryland",
                code: "MD",
                cities: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf", "Bethesda", "Rockville"]
            }
        ]
    },
    {
        name: "India",
        code: "IN",
        states: [
            // 28 States
            {
                name: "Andhra Pradesh",
                code: "AP",
                cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Machilipatnam", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Srikakulam"]
            },
            {
                name: "Arunachal Pradesh",
                code: "AR",
                cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Along", "Tezu", "Namsai", "Roing", "Changlang", "Khonsa", "Daporijo", "Anini", "Seppa"]
            },
            {
                name: "Assam",
                code: "AS",
                cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar", "Goalpara", "Dhubri", "Diphu", "North Lakhimpur", "Barpeta", "Golaghat", "Mangaldoi", "Haflong", "Nalbari", "Morigaon"]
            },
            {
                name: "Bihar",
                code: "BR",
                cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Hajipur", "Sasaram", "Dehri", "Siwan", "Motihari", "Saharsa", "Bettiah", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi", "Aurangabad", "Jehanabad"]
            },
            {
                name: "Chhattisgarh",
                code: "CG",
                cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari", "Mahasamund", "Chirmiri", "Kawardha", "Kondagaon", "Kanker", "Naila Janjgir", "Bhatapara", "Mungeli", "Tilda Newra"]
            },
            {
                name: "Goa",
                code: "GA",
                cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Valpoi", "Canacona", "Pernem", "Sanguem", "Quepem"]
            },
            {
                name: "Gujarat",
                code: "GJ",
                cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand", "Nadiad", "Morbi", "Mehsana", "Bharuch", "Porbandar", "Godhra", "Navsari", "Valsad", "Palanpur", "Vapi", "Veraval", "Bhuj", "Surendranagar", "Dahod", "Amreli"]
            },
            {
                name: "Haryana",
                code: "HR",
                cities: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Yamunanagar", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Palwal", "Rewari", "Hansi", "Narnaul", "Fatehabad", "Ratia", "Mahendragarh", "Jhajjar"]
            },
            {
                name: "Himachal Pradesh",
                code: "HP",
                cities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi", "Nahan", "Paonta Sahib", "Sundarnagar", "Kullu", "Manali", "Chamba", "Hamirpur", "Una", "Bilaspur", "Kangra", "Dalhousie", "Kasauli", "Parwanoo", "Keylong"]
            },
            {
                name: "Jharkhand",
                code: "JH",
                cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Phusro", "Medininagar", "Chirkunda", "Chaibasa", "Gumla", "Dumka", "Chas", "Adityapur", "Chatra", "Lohardaga", "Jamtara", "Sahibganj"]
            },
            {
                name: "Karnataka",
                code: "KA",
                cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Bellary", "Shimoga", "Tumkur", "Raichur", "Bijapur", "Hospet", "Gadag", "Udupi", "Chitradurga", "Hassan", "Mandya", "Kolar", "Bidar", "Chikmagalur", "Bagalkot", "Gangavathi", "Ranebennur"]
            },
            {
                name: "Kerala",
                code: "KL",
                cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Malappuram", "Kottayam", "Kasaragod", "Pathanamthitta", "Wayanad", "Idukki", "Thalassery", "Payyanur", "Ottapalam", "Manjeri", "Cherthala", "Changanassery", "Punalur", "Nilambur", "Neyyattinkara", "Ponnani", "Perinthalmanna"]
            },
            {
                name: "Madhya Pradesh",
                code: "MP",
                cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Itarsi", "Sehore", "Betul", "Seoni", "Datia", "Nagda"]
            },
            {
                name: "Maharashtra",
                code: "MH",
                cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Navi Mumbai", "Kalyan", "Dombivli", "Kolhapur", "Vasai-Virar", "Amravati", "Nanded", "Sangli", "Malegaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Ichalkaranji", "Chandrapur", "Parbhani", "Jalgaon", "Bhiwandi", "Panvel", "Satara", "Beed", "Yavatmal", "Osmanabad", "Wardha", "Gondia", "Ratnagiri", "Jalna"]
            },
            {
                name: "Manipur",
                code: "MN",
                cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Senapati", "Ukhrul", "Chandel", "Moirang", "Nambol", "Lilong", "Mayang Imphal", "Wangoi", "Jiribam", "Kangpokpi"]
            },
            {
                name: "Meghalaya",
                code: "ML",
                cities: ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Williamnagar", "Resubelpara", "Nongpoh", "Mairang", "Cherrapunji", "Mawlai", "Mawsynram"]
            },
            {
                name: "Mizoram",
                code: "MZ",
                cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Lawngtlai", "Mamit", "Saitual", "Khawzawl", "Hnahthial"]
            },
            {
                name: "Nagaland",
                code: "NL",
                cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng", "Peren", "Noklak"]
            },
            {
                name: "Odisha",
                code: "OR",
                cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Paradip", "Bhawanipatna", "Dhenkanal", "Barbil", "Angul", "Rayagada", "Kendrapara", "Sundargarh"]
            },
            {
                name: "Punjab",
                code: "PB",
                cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Faridkot", "Sangrur", "Fazilka", "Gurdaspur", "Nawanshahr", "Mansa"]
            },
            {
                name: "Rajasthan",
                code: "RJ",
                cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar", "Bharatpur", "Pali", "Sri Ganganagar", "Kishangarh", "Baran", "Sawai Madhopur", "Tonk", "Beawar", "Hanumangarh", "Dhaulpur", "Gangapur City", "Nagaur", "Banswara", "Jhunjhunu", "Chittorgarh", "Churu", "Barmer", "Jhalawar", "Dungarpur", "Bundi", "Pratapgarh"]
            },
            {
                name: "Sikkim",
                code: "SK",
                cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Singtam", "Jorethang", "Nayabazar", "Ravangla", "Pelling", "Lachen", "Lachung"]
            },
            {
                name: "Tamil Nadu",
                code: "TN",
                cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Tiruppur", "Vellore", "Thoothukudi", "Nagercoil", "Thanjavur", "Dindigul", "Cuddalore", "Kancheepuram", "Hosur", "Karur", "Nellai", "Kumbakonam", "Rajapalayam", "Pudukkottai", "Vaniyambadi", "Ambur", "Nagapattinam", "Pollachi", "Tiruvannamalai"]
            },
            {
                name: "Telangana",
                code: "TG",
                cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Jagtial", "Mancherial", "Nirmal", "Kamareddy", "Siddipet", "Wanaparthy", "Bodhan", "Sangareddy", "Vikarabad", "Medak", "Gadwal"]
            },
            {
                name: "Tripura",
                code: "TR",
                cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Ambassa", "Khowai", "Teliamura", "Sabroom", "Sonamura", "Amarpur", "Melaghar"]
            },
            {
                name: "Uttar Pradesh",
                code: "UP",
                cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Rampur", "Shahjahanpur", "Farrukhabad", "Mau", "Hapur", "Etawah", "Sambhal", "Orai", "Bahraich", "Unnao", "Rae Bareli", "Lakhimpur Kheri", "Sitapur", "Hardoi", "Faizabad", "Sultanpur", "Jaunpur", "Azamgarh", "Basti", "Gonda", "Deoria", "Ballia", "Mirzapur"]
            },
            {
                name: "Uttarakhand",
                code: "UK",
                cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Pithoragarh", "Ramnagar", "Mussoorie", "Nainital", "Almora", "Bageshwar", "Chamoli", "Champawat", "Tehri", "Uttarkashi", "Pauri"]
            },
            {
                name: "West Bengal",
                code: "WB",
                cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Cooch Behar", "Halisahar", "Kanchrapara", "Darjeeling", "Alipurduar", "Purulia"]
            },
            // 8 Union Territories
            {
                name: "Delhi",
                code: "DL",
                cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "North West Delhi", "North East Delhi", "South West Delhi", "South East Delhi", "Shahdara", "Dwarka", "Rohini", "Janakpuri", "Pitampura", "Karol Bagh", "Lajpat Nagar", "Saket", "Vasant Kunj", "Connaught Place"]
            },
            {
                name: "Andaman and Nicobar Islands",
                code: "AN",
                cities: ["Port Blair", "Car Nicobar", "Mayabunder", "Rangat", "Diglipur", "Campbell Bay", "Hut Bay", "Bamboo Flat", "Garacharma", "Prothrapur"]
            },
            {
                name: "Chandigarh",
                code: "CH",
                cities: ["Chandigarh", "Sector 17", "Sector 22", "Sector 35", "Manimajra", "Industrial Area"]
            },
            {
                name: "Dadra and Nagar Haveli and Daman and Diu",
                code: "DD",
                cities: ["Daman", "Diu", "Silvassa", "Amli", "Naroli", "Vapi"]
            },
            {
                name: "Jammu and Kashmir",
                code: "JK",
                cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Sopore", "Kathua", "Kupwara", "Pulwama", "Poonch", "Rajouri", "Budgam", "Shopian", "Bandipora", "Ganderbal", "Leh", "Kargil"]
            },
            {
                name: "Ladakh",
                code: "LA",
                cities: ["Leh", "Kargil", "Nubra", "Zanskar", "Drass", "Diskit", "Padum", "Turtuk"]
            },
            {
                name: "Lakshadweep",
                code: "LD",
                cities: ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott", "Kalpeni", "Kadmat", "Kiltan", "Chetlat", "Bitra"]
            },
            {
                name: "Puducherry",
                code: "PY",
                cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai", "Villianur", "Ariyankuppam", "Bahour"]
            }
        ]
    },
    {
        name: "Canada",
        code: "CA",
        states: [
            {
                name: "Ontario",
                code: "ON",
                cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan"]
            },
            {
                name: "Quebec",
                code: "QC",
                cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay"]
            },
            {
                name: "British Columbia",
                code: "BC",
                cities: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Victoria", "Kelowna", "Abbotsford"]
            },
            {
                name: "Alberta",
                code: "AB",
                cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat", "Grande Prairie"]
            },
            {
                name: "Manitoba",
                code: "MB",
                cities: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"]
            },
            {
                name: "Saskatchewan",
                code: "SK",
                cities: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current"]
            },
            {
                name: "Nova Scotia",
                code: "NS",
                cities: ["Halifax", "Dartmouth", "Sydney", "Truro", "New Glasgow"]
            }
        ]
    },
    {
        name: "United Kingdom",
        code: "GB",
        states: [
            {
                name: "England",
                code: "ENG",
                cities: ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Newcastle", "Bristol", "Sheffield", "Cambridge", "Oxford"]
            },
            {
                name: "Scotland",
                code: "SCT",
                cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling"]
            },
            {
                name: "Wales",
                code: "WLS",
                cities: ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry"]
            },
            {
                name: "Northern Ireland",
                code: "NIR",
                cities: ["Belfast", "Derry", "Lisburn", "Newry", "Bangor"]
            }
        ]
    },
    {
        name: "Australia",
        code: "AU",
        states: [
            {
                name: "New South Wales",
                code: "NSW",
                cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Parramatta"]
            },
            {
                name: "Victoria",
                code: "VIC",
                cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"]
            },
            {
                name: "Queensland",
                code: "QLD",
                cities: ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba"]
            },
            {
                name: "Western Australia",
                code: "WA",
                cities: ["Perth", "Fremantle", "Mandurah", "Rockingham", "Bunbury"]
            },
            {
                name: "South Australia",
                code: "SA",
                cities: ["Adelaide", "Mount Gambier", "Whyalla", "Port Augusta"]
            },
            {
                name: "Tasmania",
                code: "TAS",
                cities: ["Hobart", "Launceston", "Devonport", "Burnie"]
            }
        ]
    },
    {
        name: "Germany",
        code: "DE",
        states: [
            {
                name: "Bavaria",
                code: "BY",
                cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg"]
            },
            {
                name: "Berlin",
                code: "BE",
                cities: ["Berlin"]
            },
            {
                name: "North Rhine-Westphalia",
                code: "NW",
                cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bonn"]
            },
            {
                name: "Baden-Württemberg",
                code: "BW",
                cities: ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg"]
            },
            {
                name: "Hesse",
                code: "HE",
                cities: ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach"]
            },
            {
                name: "Hamburg",
                code: "HH",
                cities: ["Hamburg"]
            }
        ]
    },
    {
        name: "Singapore",
        code: "SG",
        states: [
            {
                name: "Central Singapore",
                code: "CS",
                cities: ["Downtown Core", "Marina Bay", "Orchard", "Novena", "Toa Payoh"]
            },
            {
                name: "North East",
                code: "NE",
                cities: ["Ang Mo Kio", "Hougang", "Punggol", "Sengkang", "Serangoon"]
            },
            {
                name: "North",
                code: "N",
                cities: ["Woodlands", "Yishun", "Sembawang", "Mandai"]
            },
            {
                name: "East",
                code: "E",
                cities: ["Bedok", "Tampines", "Pasir Ris", "Changi"]
            },
            {
                name: "West",
                code: "W",
                cities: ["Jurong East", "Jurong West", "Clementi", "Bukit Batok", "Bukit Panjang"]
            }
        ]
    },
    {
        name: "United Arab Emirates",
        code: "AE",
        states: [
            {
                name: "Dubai",
                code: "DU",
                cities: ["Dubai", "Dubai Marina", "Downtown Dubai", "Jumeirah", "Deira", "Business Bay"]
            },
            {
                name: "Abu Dhabi",
                code: "AZ",
                cities: ["Abu Dhabi", "Al Ain", "Khalifa City", "Yas Island", "Saadiyat Island"]
            },
            {
                name: "Sharjah",
                code: "SH",
                cities: ["Sharjah", "Al Majaz", "Al Nahda", "Muwaileh"]
            },
            {
                name: "Ajman",
                code: "AJ",
                cities: ["Ajman", "Al Rashidiya", "Al Nuaimiya"]
            }
        ]
    },
    {
        name: "France",
        code: "FR",
        states: [
            {
                name: "Île-de-France",
                code: "IDF",
                cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre"]
            },
            {
                name: "Provence-Alpes-Côte d'Azur",
                code: "PAC",
                cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes"]
            },
            {
                name: "Auvergne-Rhône-Alpes",
                code: "ARA",
                cities: ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Clermont-Ferrand"]
            },
            {
                name: "Nouvelle-Aquitaine",
                code: "NAQ",
                cities: ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle"]
            },
            {
                name: "Occitanie",
                code: "OCC",
                cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"]
            }
        ]
    },
    {
        name: "Netherlands",
        code: "NL",
        states: [
            {
                name: "North Holland",
                code: "NH",
                cities: ["Amsterdam", "Haarlem", "Zaanstad", "Hilversum", "Amstelveen"]
            },
            {
                name: "South Holland",
                code: "ZH",
                cities: ["Rotterdam", "The Hague", "Leiden", "Delft", "Dordrecht"]
            },
            {
                name: "North Brabant",
                code: "NB",
                cities: ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch"]
            },
            {
                name: "Utrecht",
                code: "UT",
                cities: ["Utrecht", "Amersfoort", "Nieuwegein", "Zeist"]
            }
        ]
    },
    {
        name: "Japan",
        code: "JP",
        states: [
            {
                name: "Tokyo",
                code: "TK",
                cities: ["Tokyo", "Shibuya", "Shinjuku", "Minato", "Chiyoda", "Shinagawa"]
            },
            {
                name: "Osaka",
                code: "OS",
                cities: ["Osaka", "Sakai", "Higashiosaka", "Toyonaka", "Suita"]
            },
            {
                name: "Kanagawa",
                code: "KN",
                cities: ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Hiratsuka"]
            },
            {
                name: "Aichi",
                code: "AI",
                cities: ["Nagoya", "Toyota", "Okazaki", "Ichinomiya", "Kasugai"]
            },
            {
                name: "Kyoto",
                code: "KY",
                cities: ["Kyoto", "Uji", "Nagaokakyo", "Kameoka", "Fukuchiyama"]
            },
            {
                name: "Fukuoka",
                code: "FK",
                cities: ["Fukuoka", "Kitakyushu", "Kurume", "Omuta", "Iizuka"]
            }
        ]
    },
    {
        name: "Ireland",
        code: "IE",
        states: [
            {
                name: "Leinster",
                code: "L",
                cities: ["Dublin", "Dún Laoghaire", "Drogheda", "Dundalk", "Swords", "Bray"]
            },
            {
                name: "Munster",
                code: "M",
                cities: ["Cork", "Limerick", "Waterford", "Tralee", "Killarney"]
            },
            {
                name: "Connacht",
                code: "C",
                cities: ["Galway", "Sligo", "Castlebar", "Ballina"]
            },
            {
                name: "Ulster (Irish Part)",
                code: "U",
                cities: ["Letterkenny", "Monaghan", "Cavan", "Donegal"]
            }
        ]
    }
];

// Helper function to get states by country name
export const getStatesByCountry = (countryName: string): State[] => {
    const country = countries.find(c => c.name === countryName);
    return country?.states || [];
};

// Helper function to get cities by country and state name
export const getCitiesByState = (countryName: string, stateName: string): string[] => {
    const country = countries.find(c => c.name === countryName);
    if (!country) return [];
    const state = country.states.find(s => s.name === stateName);
    return state?.cities || [];
};
