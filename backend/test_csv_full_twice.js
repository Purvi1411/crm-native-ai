const axios = require('axios');
const fs = require('fs');
async function test() {
  try {
    const resAuth = await axios.post('https://crm-native-ai-1.onrender.com/api/auth/register', {
      name: 'Test User 5', email: 'testcsv51@example.com', password: 'password123'
    });
    const token = resAuth.data.token;

    const text = fs.readFileSync('C:/Users/palpu/Downloads/customers_200.csv', 'utf8');
    const stripQuotes = (str) => str.replace(/^["']|["']$/g, '');
    const parseCSVRow = (row) => {
      const result = [];
      let insideQuotes = false;
      let currentVal = '';
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') { insideQuotes = !insideQuotes; }
        else if (char === ',' && !insideQuotes) { result.push(currentVal); currentVal = ''; }
        else { currentVal += char; }
      }
      result.push(currentVal);
      return result;
    };
    const rows = text.split('\n').map(row => row.trim()).filter(row => row);
    const headers = parseCSVRow(rows[0]).map(h => stripQuotes(h.trim()).toLowerCase());
    const customers = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = parseCSVRow(rows[i]).map(c => stripQuotes(c.trim()));
      const getCol = (possibleNames) => {
        const idx = headers.findIndex(h => possibleNames.some(p => h.includes(p)));
        return idx >= 0 ? cols[idx] : null;
      };
      const name = getCol(['name', 'fullname', 'first']);
      const email = getCol(['email']);
      let parsedDate = new Date();
      const rawDate = getCol(['last', 'date', 'order']);
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) { parsedDate = d; }
      }
      customers.push({
        name, email,
        totalSpent: Number(getCol(['spent', 'total', 'revenue', 'ltv', 'price'])) || 0,
        visits: Number(getCol(['visit', 'order', 'frequency', 'count'])) || 0,
        lastOrderDate: parsedDate,
        gender: getCol(['gender', 'sex']),
        ageGroup: getCol(['age'])
      });
    }

    console.log('Doing first upload (Insert)...');
    let resBulk = await axios.post('https://crm-native-ai-1.onrender.com/api/customers/bulk', { customers }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Success 1:', resBulk.data.message);

    console.log('Doing second upload (Update)...');
    resBulk = await axios.post('https://crm-native-ai-1.onrender.com/api/customers/bulk', { customers }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Success 2:', resBulk.data.message);

  } catch(e) {
    console.log('Error:', e.response ? e.response.data : e.message);
  }
}
test();
