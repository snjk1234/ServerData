const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].replace(/"/g, '').trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function fetchAll() {
  const { data, error } = await supabase.from('branch_connections').select('*');
  if (error) {
    console.error('Error fetching schema:', error);
  } else {
    console.log('All records:');
    console.log(data);
  }
}
fetchAll();
