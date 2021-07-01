import {writeFile} from 'fs';
import {get} from 'native-request';
import {createInterface} from 'readline';

const path = process.argv[3] || 'saved-file';

get(`https://${process.argv[2] || 'www.example.edu'}`, (err, data, status) => {
  if (status === 404) {
    console.log('Page not found aka Error 404');
    process.exit(1);
  }
  if (err) {
    if (err.code === 'ENOTFOUND') {
      console.log('Hostname not found');
      process.exit(1);
    }
    throw err;
  }
  if (status !== 200) {
    console.log('NOT OK STATUS:', status);
    process.exit(1);
  }
  writeFile(path, data, {flag: 'wx'}, err => {
    if (err) {
      if (err.code === 'EEXIST') {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question(
          `Looks like '${path}' already exists, overwrite? y/n > `,
          ans => {
            ans = ans.trim().toUpperCase();
            if (ans === 'Y' || ans === 'YES') {
              writeFile(path, data, err => {
                if (err) throw err;
                console.log(
                  `Downloaded ${data.length} bytes, '${path}' was overwritten`
                );
              });
            }
            rl.close();
          }
        );
      } else throw err;
    } else {
      console.log(`Downloaded ${data.length} bytes and saved to '${path}'`);
    }
  });
});
