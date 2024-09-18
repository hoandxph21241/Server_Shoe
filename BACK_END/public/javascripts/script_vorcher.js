

document.addEventListener('DOMContentLoaded', function () {
    var editModal = document.getElementById('editModal');

    editModal.addEventListener('show.bs.modal', function (event) {
        var button = event.relatedTarget; // Nút được nhấp
        var couponCode = button.getAttribute('data-id');
        var discountAmount = button.getAttribute('data-discount-amount');
        var endDate = button.getAttribute('data-end-date');
        var maxUser = button.getAttribute('data-max-user');

        var modal = editModal.querySelector('form');
        modal.querySelector('#editDiscountId').value = couponCode;
        modal.querySelector('#editDiscountAmount').value = discountAmount;
        modal.querySelector('#editEndDate').value = endDate;
        modal.querySelector('#editMaxUser').value = maxUser;
    });
});
