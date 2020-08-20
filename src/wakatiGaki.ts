const util = require('util')
const exec = util.promisify(require('child_process').exec)


export const wakatiGaki = async (title: string): Promise<string> => {
  const { stdout, stderr } = await exec(`echo "${title}" | mecab -Owakati`);
  if (stderr) {
    console.log(stderr);
    return "";
  }
  return stdout.trim();
};
