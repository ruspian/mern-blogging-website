let bulan = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agt",
  "Sept",
  "Okt",
  "Nov",
  "Des",
];
let hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const tanggal = (timestamp) => {
  let tanggal = new Date(timestamp);
  return ` ${hari[tanggal.getDay()]}, ${tanggal.getDate()} ${
    bulan[tanggal.getMonth()]
  } ${tanggal.getFullYear()}`;
};
