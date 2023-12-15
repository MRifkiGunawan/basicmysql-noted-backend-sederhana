'use strict';

const Hapi = require('@hapi/hapi');
const mysql = require('mysql2/promise');
const nanoid = require('nanoid');
const init = async () => {

    const server = Hapi.server({
        port: 9000,
        host: 'localhost'
    });
// Konfigurasi koneksi MySQL
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Ganti dengan username MySQL Anda
    password: '****',  // Ganti dengan password MySQL Anda
    database: 'catatan' // Ganti dengan nama database Anda
});

server.route([{
    method: 'POST',
    path:'/beranda',
    handler: async (request,h)=>{
     try {
         const {catatan} = request.payload;
         const waktu = new Date().toString();
         const [result] = await connection.execute(
            'INSERT INTO catatan (catatan, waktu) VALUES (?, ?)',
            [ catatan, waktu]
          );
          // Mengembalikan ID data yang baru disisipkan
          return {id:result.insertId , message: 'Data berhasil ditambahkan' };
     } catch (error) {
        console.error('Error inserting data to MySQL:', error);
        return h.response('Internal Server Error').code(500);
     }   
    }
},
{
    method: 'GET',
    path:'/beranda',
    handler: async(request,h)=>{
        try {
            // Lakukan query untuk mengambil data dari tabel
            const [results] = await connection.execute('SELECT * FROM catatan');
            return { data: results };
        } catch (error) {
            console.error('Error fetching data from MySQL:', error);
            return h.response('Internal Server Error').code(500);
        }
    }  
},
{
    method:'GET',
    path:'/beranda/{id}',
    handler: async(request,h) =>{
        try {
            const {id} = request.params;
            const [result] = await connection.execute('SELECT * FROM catatan WHERE id = ?', [id]);
            // Periksa apakah data ditemukan atau tidak
          if (result.length > 0) {
        return { data: result[0] };
      } else {
        return { message: 'Data tidak ditemukan' };
      }
        } catch (error) {
            console.error('Error fetching data from MySQL:', error);
      return h.response('Internal Server Error').code(500);
        }
    }
},
{
    method:'PUT',
    path:'/beranda/{id}',
    handler: async(request,h) => {
        try {
            const {id} = request.params;
            const {catatan} = request.payload;
            const waktu = new Date().toString();
             const [result] =await connection.execute(
                'UPDATE catatan SET catatan = ?, waktu = ? WHERE id = ?',
          [catatan, waktu, id]
            );
            return { message: 'Data berhasil diperbarui' };
        } catch (error) {
            console.error('Error updating data in MySQL:',error);
            return h.response('Internal Server Error').code(500);
        }
    }
},
{
    method:'DELETE',
    path: '/beranda/{id}',
    handler: async(request,h) => {
        try {
            const {id} = request.params;
            const [result] = await connection.execute(
                'DELETE FROM catatan WHERE id = ?',
                [id]
              );
// Periksa apakah data berhasil dihapus
if (result.affectedRows > 0) {
    return { message: 'Data berhasil dihapus' };
  } else {
    return { message: 'Data tidak ditemukan' };
  }        
        } catch (error) {
            console.error('Error deleting data from MySQL:', error);
            return h.response('Internal Server Error').code(500);         
        }
    }
}]);
    await server.start();
    console.log('Server berjalan pada %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();