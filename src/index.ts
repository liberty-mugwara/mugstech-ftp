import Ftp from "jsftp";

export function createFtpClient() {
  return new Ftp({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USERNAME,
    pass: process.env.FTP_PASSWORD,
  });
}

export async function sendTeccomFileToFtp({
  file,
  remotePath,
}: {
  file: Buffer;
  remotePath: string;
}) {
  const Ftp = createFtpClient();

  try {
    await new Promise((resolve, reject) => {
      Ftp.put(file, remotePath, (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject();
        }
      });
    });

    Ftp.destroy();

    return { fileTransmited: true };
  } catch (e) {
    Ftp.destroy();
    console.error(e);
    return { fileTransmited: false };
  }
}

export async function sendTeccomFilesToFtp(
  files: {
    file: Buffer;
    fileName: string;
    orderId: string;
  }[]
) {
  const Ftp = createFtpClient();
  const transmittedOrderIds: string[] = [];

  async function transmit() {
    try {
      for (const doc of files) {
        await new Promise((resolve, reject) => {
          Ftp.put(doc.file, `ORDERS/IN/${doc.fileName}`, (err) => {
            if (!err) {
              transmittedOrderIds.push(doc.orderId);
              resolve(true);
            } else reject();
          });
        });
      }
    } catch (e) {
      throw e;
    }
  }

  try {
    await transmit().catch((e) => console.error(e));
    Ftp.destroy();
    return transmittedOrderIds;
  } catch (error) {
    Ftp.destroy();
    throw error;
  }
}
