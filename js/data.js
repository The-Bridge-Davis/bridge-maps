// The markers data frame. `name`, `city` and `country` are required -- the
// panel heading reads "Pray for {name} in {city}, {country}" straight off them.
// `image` takes a Google Drive share link (the file must be shared as "anyone
// with the link") or any direct image URL, including a local path such as
// "images/marie dupont.png". Any size or shape works; it is shown as a
// centred square crop.
export const MARKERS = [
  {
    id: "marie",
    lat: 48.8566,
    lng: 2.3522,
    name: "Marie Dupont",
    city: "Paris",
    country: "France",
    image: "https://drive.google.com/file/d/1mLCKur9V9xCByPaAk-mj-gyS9Hy5MG46/view?usp=sharing",
    prayer: "Pray for strength during a difficult season at work.",
    description:
      "Marie has been carrying a heavy load at work for months, with long hours and a team in the middle of restructuring. She is asking for steadiness through the uncertainty, wisdom about whether to stay, and enough rest to keep showing up for her family in the evenings.",
  },
  {
    id: "james",
    lat: -33.8688,
    lng: 151.2093,
    name: "James Carter",
    city: "Sydney",
    country: "Australia",
    image: "https://drive.google.com/file/d/1Fvft-00y6EYu9bZsNIxrpapNs6LxURQH/view?usp=sharing",
    prayer: "Pray for healing after a recent surgery.",
    description:
      "James came through surgery three weeks ago and recovery has been slower than the doctors expected. Pray for clean healing, for patience with the limits of a body that is not cooperating yet, and for the friends who have been driving him to appointments.",
  },
  {
    id: "yuki",
    lat: 35.6762,
    lng: 139.6503,
    name: "Yuki Tanaka",
    city: "Tokyo",
    country: "Japan",
    image: "https://drive.google.com/file/d/1b9REojqJZUaRrIzy3hWvU6vshIH9xSh-/view?usp=sharing",
    prayer: "Pray for guidance in a new ministry opportunity.",
    description:
      "Yuki has been offered a role starting a small community ministry across the city, and it would mean leaving work she is good at for something with no map. Pray for clarity about the timing, courage if the answer is yes, and peace if it is not.",
  },
  {
    id: "ana",
    lat: -22.9068,
    lng: -43.1729,
    name: "Ana Silva",
    city: "Rio de Janeiro",
    country: "Brazil",
    image: "https://drive.google.com/file/d/10PVyNlFcv2jvJqyR2XclY7KWxawfso1D/view?usp=sharing",
    prayer: "Pray for provision for her family during financial hardship.",
    description:
      "Ana's household lost its main income in the spring and the gap has not closed since. Pray for steady work that fits around her children's school hours, for the rent to be covered this month, and that the strain stays off the kids.",
  },
  {
    id: "etiolles",
    lat: 48.651217,
    lng: 2.500984,
    name: "Luc Moreau",
    city: "Étiolles",
    country: "France",
    image: "https://drive.google.com/file/d/1Dzjgu82x1Du58joP6XOoo7QL70czvQtE/view?usp=sharing",
    prayer: "Pray for patience and joy in a new season of fatherhood.",
    description:
      "Luc and his wife welcomed their first child in the spring, and the sleepless weeks have left him running on empty. Pray for patience with himself, for rest to come in the small windows he has, and for the church family nearby to keep showing up with meals and company.",
  },
];
