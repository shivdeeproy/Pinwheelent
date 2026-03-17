const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest);
      reject(err.message);
    });
  });
};

download('https://lh3.googleusercontent.com/chat_attachment/AFoxzAEbW9oJ13Y1P-4vG_uXJ4_KHzYgSgP7oH-mR5cWp8RHz_v-9_T3q0U6wP3w04_NqQqfQQ3sFzj9128P_E_s_Pj-L_CqW_U1m4L6M1lDqC6sQ2v5G-QxO-Z0C_rKqK8W8X-e5zH598FjZ8sA=s0', 'src/assets/logo-light.png');
download('https://lh3.googleusercontent.com/chat_attachment/AFoxzAGS-R6L-C_4GndH_5iS7n_8OEvT8wLssZq_lP7v_cEqQ7D2A8R9u9gD_zZp_s_FmH2o9Gj892DDBkM-4f0eT1B6yO9aYI4A8y-W0_mZJvj3YnF-q2mQz2HwTqK_xK3c_O4yB_o6bLpL1KqK=s0', 'src/assets/logo-dark.png');