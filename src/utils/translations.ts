export const translateStatus = (status: string) => {
  switch (status) {
    case 'open':
      return 'Abierto';
    case 'closed':
      return 'Cerrado';
  }
};
