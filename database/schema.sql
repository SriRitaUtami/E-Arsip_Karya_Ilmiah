-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2026 at 02:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `karyailmiah`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nip` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(10) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `karya_ilmiah`
--

CREATE TABLE `karya_ilmiah` (
  `id` int(11) NOT NULL,
  `nis` varchar(20) DEFAULT NULL,
  `nama_peneliti` varchar(100) NOT NULL,
  `judul` text NOT NULL,
  `tahun_ajaran` varchar(20) NOT NULL,
  `tanggal_upload` date NOT NULL,
  `file_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `allow_download` tinyint(1) DEFAULT 1,
  `diupload_oleh_id` int(11) DEFAULT NULL,
  `uploaded_by_role` varchar(10) DEFAULT NULL,
  `nomor_sertifikat` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `allow_download` tinyint(1) DEFAULT 1,
  `allow_upload` tinyint(1) DEFAULT 1,
  `allow_print` tinyint(1) DEFAULT 1,
  `nama_kepsek` varchar(100) DEFAULT 'Riadhi, S.Pd., M.Pd',
  `nip_kepsek` varchar(30) DEFAULT '197001012000121001',
  `nomor_urut_sertifikat` int(11) DEFAULT 0,
  `format_nomor_sertifikat` varchar(100) DEFAULT '{nomor}/SKT/RIAB/{bulan}/{tahun}',
  `nama_sekolah` varchar(150) DEFAULT 'RUHUL ISLAM ANAK BANGSA',
  `alamat_sekolah` varchar(255) DEFAULT 'Jl. Ajun, Gue Gajah, Kec. Darul Imarah, Kabupaten Aceh Besar, Aceh 23233',
  `npsn_sekolah` varchar(20) DEFAULT '10114244',
  `akreditasi_sekolah` varchar(20) DEFAULT 'A',
  `logo_sekolah_url` varchar(500) DEFAULT NULL,
  `warna_header` varchar(7) DEFAULT '#8b6914'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(10) DEFAULT 'siswa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- Indexes for table `karya_ilmiah`
--
ALTER TABLE `karya_ilmiah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_karya_siswa` (`nis`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nis` (`nis`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `karya_ilmiah`
--
ALTER TABLE `karya_ilmiah`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `karya_ilmiah`
--
ALTER TABLE `karya_ilmiah`
  ADD CONSTRAINT `fk_karya_siswa` FOREIGN KEY (`nis`) REFERENCES `siswa` (`nis`) ON DELETE SET NULL ON UPDATE CASCADE;
   INSERT INTO `settings` (`id`) VALUES (1);

   INSERT INTO `admin` (`nama`, `nip`, `password`, `role`)
   VALUES ('Administrator', 'admin', '$2b$10$mdQLDrqCRGsbzXN2gqAB/.xpsLM31IAG6iWlZCeArfWFVK68OBrMC', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
