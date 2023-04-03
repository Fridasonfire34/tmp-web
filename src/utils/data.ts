const groupArray = (array: any, key: string) => {
  return array.reduce((result: any, currentValue: any) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
};

const sameKeysFromArray = (array: any) => {
  const keys = array.map((item: any) => Object.keys(item));
  const sameKeys = keys.reduce((a: any, b: any) =>
    a.filter((c: any) => b.includes(c))
  );
  return sameKeys;
};

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${day}-${month}-${year}`;
};

const formatDateWithTime = (date: string) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export { formatDate, formatDateWithTime, groupArray, sameKeysFromArray };
