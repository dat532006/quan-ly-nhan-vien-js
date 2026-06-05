var danhSachNhanVien = [];
var STORAGE_KEY = "danhSachNhanVien";
var editMode = false;

function NhanVien(taiKhoan, hoTen, email, matKhau, ngayLam, luongCoBan, chucVu, gioLam) {
  this.taiKhoan = taiKhoan;
  this.hoTen = hoTen;
  this.email = email;
  this.matKhau = matKhau;
  this.ngayLam = ngayLam;
  this.luongCoBan = Number(luongCoBan);
  this.chucVu = chucVu;
  this.gioLam = Number(gioLam);
  this.tongLuong = 0;
  this.loaiNhanVien = "";
}

NhanVien.prototype.tinhTongLuong = function () {
  var heSo = 1;

  if (this.chucVu === "Giám đốc") {
    heSo = 3;
  } else if (this.chucVu === "Trưởng Phòng") {
    heSo = 2;
  }

  this.tongLuong = this.luongCoBan * heSo;
  return this.tongLuong;
};

NhanVien.prototype.xepLoai = function () {
  if (this.gioLam >= 192) {
    this.loaiNhanVien = "Xuất sắc";
  } else if (this.gioLam >= 176) {
    this.loaiNhanVien = "Giỏi";
  } else if (this.gioLam >= 160) {
    this.loaiNhanVien = "Khá";
  } else {
    this.loaiNhanVien = "Trung bình";
  }

  return this.loaiNhanVien;
};

function taoNhanVienTuDuLieu(data) {
  var nhanVien = new NhanVien(
    data.taiKhoan,
    data.hoTen,
    data.email,
    data.matKhau,
    data.ngayLam,
    data.luongCoBan,
    data.chucVu,
    data.gioLam
  );

  nhanVien.tinhTongLuong();
  nhanVien.xepLoai();
  return nhanVien;
}

function layDanhSachTuLocalStorage() {
  var data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return;
  }

  try {
    var parsed = JSON.parse(data);
    danhSachNhanVien = parsed.map(function (item) {
      return taoNhanVienTuDuLieu(item);
    });
  } catch (error) {
    danhSachNhanVien = [];
  }
}

function luuDanhSachVaoLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(danhSachNhanVien));
}

function dinhDangTien(value) {
  return Number(value).toLocaleString("vi-VN");
}

function chuanHoaChuoi(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hienThiDanhSach(danhSach) {
  var tbody = document.getElementById("tableDanhSach");
  var html = "";

  for (var i = 0; i < danhSach.length; i++) {
    var nhanVien = danhSach[i];
    html += "<tr>";
    html += "<td>" + nhanVien.taiKhoan + "</td>";
    html += "<td>" + nhanVien.hoTen + "</td>";
    html += "<td>" + nhanVien.email + "</td>";
    html += "<td>" + nhanVien.ngayLam + "</td>";
    html += "<td>" + nhanVien.chucVu + "</td>";
    html += "<td>" + dinhDangTien(nhanVien.tongLuong) + "</td>";
    html += "<td>" + nhanVien.loaiNhanVien + "</td>";
    html +=
      "<td class='text-nowrap'>" +
      "<button class='btn btn-info btn-sm mr-1' onclick=\"suaNhanVien('" +
      nhanVien.taiKhoan +
      "')\">Sửa</button>" +
      "<button class='btn btn-danger btn-sm' onclick=\"xoaNhanVien('" +
      nhanVien.taiKhoan +
      "')\">Xóa</button>" +
      "</td>";
    html += "</tr>";
  }

  tbody.innerHTML = html;
}

function hienThiThongBao(id, message) {
  var element = document.getElementById(id);
  element.innerText = message;
  element.style.display = "block";
}

function anThongBao(id) {
  var element = document.getElementById(id);
  element.innerText = "";
  element.style.display = "none";
}

function layGiaTriForm() {
  return {
    taiKhoan: document.getElementById("tknv").value.trim(),
    hoTen: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    matKhau: document.getElementById("password").value,
    ngayLam: document.getElementById("datepicker").value.trim(),
    luongCoBan: document.getElementById("luongCB").value.replace(/[,\.\s]/g, ""),
    chucVu: document.getElementById("chucvu").value,
    gioLam: document.getElementById("gioLam").value.trim()
  };
}

function kiemTraNgayHopLe(value) {
  var match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return false;
  }

  var month = Number(match[1]);
  var day = Number(match[2]);
  var year = Number(match[3]);
  var date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function taiKhoanDaTonTai(taiKhoan) {
  return danhSachNhanVien.some(function (nhanVien) {
    return nhanVien.taiKhoan === taiKhoan;
  });
}

function validateForm(isUpdate) {
  var data = layGiaTriForm();
  var isValid = true;
  var nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{6,10}$/;

  if (!/^\d{4,6}$/.test(data.taiKhoan)) {
    hienThiThongBao("tbTKNV", "Tài khoản phải gồm 4 - 6 ký số.");
    isValid = false;
  } else if (!isUpdate && taiKhoanDaTonTai(data.taiKhoan)) {
    hienThiThongBao("tbTKNV", "Tài khoản đã tồn tại.");
    isValid = false;
  } else {
    anThongBao("tbTKNV");
  }

  if (!data.hoTen || !nameRegex.test(data.hoTen)) {
    hienThiThongBao("tbTen", "Tên nhân viên phải là chữ và không được để trống.");
    isValid = false;
  } else {
    anThongBao("tbTen");
  }

  if (!data.email || !emailRegex.test(data.email)) {
    hienThiThongBao("tbEmail", "Email không đúng định dạng.");
    isValid = false;
  } else {
    anThongBao("tbEmail");
  }

  if (!data.matKhau || !passwordRegex.test(data.matKhau)) {
    hienThiThongBao(
      "tbMatKhau",
      "Mật khẩu 6 - 10 ký tự, có số, chữ in hoa và ký tự đặc biệt."
    );
    isValid = false;
  } else {
    anThongBao("tbMatKhau");
  }

  if (!data.ngayLam || !kiemTraNgayHopLe(data.ngayLam)) {
    hienThiThongBao("tbNgay", "Ngày làm phải đúng định dạng mm/dd/yyyy.");
    isValid = false;
  } else {
    anThongBao("tbNgay");
  }

  if (
    !/^\d+$/.test(data.luongCoBan) ||
    Number(data.luongCoBan) < 1000000 ||
    Number(data.luongCoBan) > 20000000
  ) {
    hienThiThongBao("tbLuongCB", "Lương cơ bản phải từ 1.000.000 đến 20.000.000.");
    isValid = false;
  } else {
    anThongBao("tbLuongCB");
  }

  if (!["Giám đốc", "Trưởng Phòng", "Nhân Viên"].includes(data.chucVu)) {
    hienThiThongBao("tbChucVu", "Vui lòng chọn chức vụ hợp lệ.");
    isValid = false;
  } else {
    anThongBao("tbChucVu");
  }

  if (!/^\d+$/.test(data.gioLam) || Number(data.gioLam) < 80 || Number(data.gioLam) > 200) {
    hienThiThongBao("tbGiolam", "Số giờ làm phải từ 80 đến 200 giờ.");
    isValid = false;
  } else {
    anThongBao("tbGiolam");
  }

  return {
    isValid: isValid,
    data: data
  };
}

function resetForm() {
  document.getElementById("tknv").value = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("luongCB").value = "";
  document.getElementById("chucvu").selectedIndex = 0;
  document.getElementById("gioLam").value = "";

  var today = new Date();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  document.getElementById("datepicker").value = month + "/" + day + "/" + today.getFullYear();

  [
    "tbTKNV",
    "tbTen",
    "tbEmail",
    "tbMatKhau",
    "tbNgay",
    "tbLuongCB",
    "tbChucVu",
    "tbGiolam"
  ].forEach(anThongBao);
}

function timNhanVienTheoTaiKhoan(taiKhoan) {
  return danhSachNhanVien.find(function (nhanVien) {
    return nhanVien.taiKhoan === taiKhoan;
  });
}

function timViTriNhanVien(taiKhoan) {
  return danhSachNhanVien.findIndex(function (nhanVien) {
    return nhanVien.taiKhoan === taiKhoan;
  });
}

function themNhanVien() {
  var result = validateForm(false);
  if (!result.isValid) {
    return;
  }

  var nhanVien = taoNhanVienTuDuLieu(result.data);
  danhSachNhanVien.push(nhanVien);
  luuDanhSachVaoLocalStorage();
  hienThiDanhSach(danhSachNhanVien);
  $("#myModal").modal("hide");
  resetForm();
}

function xoaNhanVien(taiKhoan) {
  danhSachNhanVien = danhSachNhanVien.filter(function (nhanVien) {
    return nhanVien.taiKhoan !== taiKhoan;
  });
  luuDanhSachVaoLocalStorage();
  hienThiDanhSach(danhSachNhanVien);
}

function suaNhanVien(taiKhoan) {
  var nhanVien = timNhanVienTheoTaiKhoan(taiKhoan);
  if (!nhanVien) {
    return;
  }

  editMode = true;
  document.getElementById("header-title").innerText = "Cập nhật nhân viên";
  document.getElementById("btnThemNV").style.display = "none";
  document.getElementById("btnCapNhat").style.display = "inline-block";
  document.getElementById("tknv").disabled = true;

  document.getElementById("tknv").value = nhanVien.taiKhoan;
  document.getElementById("name").value = nhanVien.hoTen;
  document.getElementById("email").value = nhanVien.email;
  document.getElementById("password").value = nhanVien.matKhau;
  document.getElementById("datepicker").value = nhanVien.ngayLam;
  document.getElementById("luongCB").value = nhanVien.luongCoBan;
  document.getElementById("chucvu").value = nhanVien.chucVu;
  document.getElementById("gioLam").value = nhanVien.gioLam;

  $("#myModal").modal("show");
}

function capNhatNhanVien() {
  var result = validateForm(true);
  if (!result.isValid) {
    return;
  }

  var index = timViTriNhanVien(result.data.taiKhoan);
  if (index === -1) {
    return;
  }

  danhSachNhanVien[index] = taoNhanVienTuDuLieu(result.data);
  luuDanhSachVaoLocalStorage();
  hienThiDanhSach(danhSachNhanVien);
  $("#myModal").modal("hide");
  resetForm();
}

function timNhanVienTheoLoai() {
  var keyword = chuanHoaChuoi(document.getElementById("searchName").value);

  if (!keyword) {
    hienThiDanhSach(danhSachNhanVien);
    return;
  }

  var ketQua = danhSachNhanVien.filter(function (nhanVien) {
    return chuanHoaChuoi(nhanVien.loaiNhanVien).indexOf(keyword) !== -1;
  });

  hienThiDanhSach(ketQua);
}

function sapXepTheoTaiKhoan(tangDan) {
  danhSachNhanVien.sort(function (a, b) {
    if (a.taiKhoan === b.taiKhoan) {
      return 0;
    }

    if (tangDan) {
      return a.taiKhoan > b.taiKhoan ? 1 : -1;
    }

    return a.taiKhoan < b.taiKhoan ? 1 : -1;
  });

  document.getElementById("SapXepTang").style.display = tangDan ? "none" : "inline-block";
  document.getElementById("SapXepGiam").style.display = tangDan ? "inline-block" : "none";
  hienThiDanhSach(danhSachNhanVien);
}

function moFormThemNhanVien() {
  editMode = false;
  resetForm();
  document.getElementById("header-title").innerText = "Thêm nhân viên";
  document.getElementById("btnThemNV").style.display = "inline-block";
  document.getElementById("btnCapNhat").style.display = "none";
  document.getElementById("tknv").disabled = false;
}

document.addEventListener("DOMContentLoaded", function () {
  layDanhSachTuLocalStorage();
  hienThiDanhSach(danhSachNhanVien);
  moFormThemNhanVien();

  document.getElementById("btnThem").addEventListener("click", moFormThemNhanVien);
  document.getElementById("btnThemNV").addEventListener("click", themNhanVien);
  document.getElementById("btnCapNhat").addEventListener("click", capNhatNhanVien);
  document.getElementById("btnTimNV").addEventListener("click", timNhanVienTheoLoai);
  document.getElementById("searchName").addEventListener("keyup", timNhanVienTheoLoai);
  document.getElementById("SapXepTang").addEventListener("click", function () {
    sapXepTheoTaiKhoan(true);
  });
  document.getElementById("SapXepGiam").addEventListener("click", function () {
    sapXepTheoTaiKhoan(false);
  });
});
