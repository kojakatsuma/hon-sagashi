const util = require('util')
const exec = util.promisify(require('child_process').exec)


exports.wakatiGaki = async (title) => {
  const { stdout, stderr } = await exec(`echo "${title}" | mecab -Owakati`);
  if (stderr) {
    console.log(stderr);
    return null;
  }
  return stdout.trim();
};
