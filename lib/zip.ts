type ZipEntryInput = {
  fileName: string;
  body: AsyncIterable<Uint8Array>;
};

type CentralDirectoryEntry = {
  fileNameBuffer: Buffer;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

const ZIP_FLAG_DATA_DESCRIPTOR = 0x0008;
const ZIP_FLAG_UTF8 = 0x0800;
const ZIP_FLAGS = ZIP_FLAG_DATA_DESCRIPTOR | ZIP_FLAG_UTF8;
const ZIP_METHOD_STORE = 0;
const ZIP_VERSION = 20;
const ZIP_MAX_UINT32 = 0xffffffff;

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let value = i;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[i] = value >>> 0;
}

function updateCrc32(previous: number, chunk: Uint8Array) {
  let crc = previous ^ 0xffffffff;
  for (const byte of chunk) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function assertZipUint32(value: number, label: string) {
  if (value > ZIP_MAX_UINT32) {
    throw new Error(`${label} ZIP sınırını aşıyor.`);
  }
}

function createLocalFileHeader(fileNameBuffer: Buffer) {
  const { dosDate, dosTime } = getDosDateTime();
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(ZIP_VERSION, 4);
  header.writeUInt16LE(ZIP_FLAGS, 6);
  header.writeUInt16LE(ZIP_METHOD_STORE, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(0, 18);
  header.writeUInt32LE(0, 22);
  header.writeUInt16LE(fileNameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, fileNameBuffer]);
}

function createDataDescriptor(crc32: number, size: number) {
  assertZipUint32(size, "Dosya boyutu");
  const descriptor = Buffer.alloc(16);
  descriptor.writeUInt32LE(0x08074b50, 0);
  descriptor.writeUInt32LE(crc32 >>> 0, 4);
  descriptor.writeUInt32LE(size, 8);
  descriptor.writeUInt32LE(size, 12);
  return descriptor;
}

function createCentralDirectoryHeader(entry: CentralDirectoryEntry) {
  const { dosDate, dosTime } = getDosDateTime();
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(ZIP_VERSION, 4);
  header.writeUInt16LE(ZIP_VERSION, 6);
  header.writeUInt16LE(ZIP_FLAGS, 8);
  header.writeUInt16LE(ZIP_METHOD_STORE, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(entry.crc32 >>> 0, 16);
  header.writeUInt32LE(entry.compressedSize, 20);
  header.writeUInt32LE(entry.uncompressedSize, 24);
  header.writeUInt16LE(entry.fileNameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.localHeaderOffset, 42);
  return Buffer.concat([header, entry.fileNameBuffer]);
}

function createEndOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  assertZipUint32(entryCount, "Dosya sayısı");
  assertZipUint32(centralDirectorySize, "Merkezi dizin boyutu");
  assertZipUint32(centralDirectoryOffset, "Merkezi dizin konumu");

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entryCount, 8);
  eocd.writeUInt16LE(entryCount, 10);
  eocd.writeUInt32LE(centralDirectorySize, 12);
  eocd.writeUInt32LE(centralDirectoryOffset, 16);
  eocd.writeUInt16LE(0, 20);
  return eocd;
}

export async function* createZipStream(entries: ZipEntryInput[]) {
  const centralDirectory: CentralDirectoryEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const fileNameBuffer = Buffer.from(entry.fileName, "utf8");
    const localHeaderOffset = offset;
    const localHeader = createLocalFileHeader(fileNameBuffer);
    yield localHeader;
    offset += localHeader.length;

    let crc32 = 0;
    let size = 0;

    for await (const chunk of entry.body) {
      crc32 = updateCrc32(crc32, chunk);
      size += chunk.length;
      assertZipUint32(size, "Dosya boyutu");
      yield chunk;
      offset += chunk.length;
    }

    const descriptor = createDataDescriptor(crc32, size);
    yield descriptor;
    offset += descriptor.length;

    centralDirectory.push({
      fileNameBuffer,
      crc32,
      compressedSize: size,
      uncompressedSize: size,
      localHeaderOffset,
    });
  }

  const centralDirectoryOffset = offset;
  let centralDirectorySize = 0;

  for (const entry of centralDirectory) {
    const header = createCentralDirectoryHeader(entry);
    yield header;
    centralDirectorySize += header.length;
    offset += header.length;
  }

  yield createEndOfCentralDirectory(centralDirectory.length, centralDirectorySize, centralDirectoryOffset);
}
