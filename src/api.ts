const resource = [
  {
    id: 1,
    delay: 200,
    name: 'tim',
    workType: 'ot',
  },
  {
    id: 2,
    delay: 2000,
    name: 'ng how',
    workType: 'to',
  },
  {
    id: 3,
    delay: 5000,
    name: 'jeager',
    workType: 'to',
  },
];

export async function fetcher(index: number) {
  return new Promise<(typeof resource)[number]>((resolve) => {
    const result = resource[index];
    setTimeout(() => {
      resolve(result);
    }, result.delay);
  });
}
