const zipExtract = require('./extractors/zip');
const tarGzExtract = require('./extractors/tar_gz');
import { ZIP, TAR } from './type_from_filename';

export default function extractArchive(settings, logger, archiveType) {
  switch (archiveType) {
    case ZIP:
      return zipExtract(settings, logger);
      break;
    case TAR:
      return tarGzExtract(settings, logger);
      break;
    default:
      throw new Error('Unsupported archive format.');
  }
};
