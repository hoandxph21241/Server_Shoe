
document.addEventListener('DOMContentLoaded', function () {
    let storageShoeCount = 0;
    let selectedSizes = {};
    let selectedColors = {};

    function createStorageShoeEntry() {
        storageShoeCount++;
        const entryHtml = `
            <div class="storage-shoe-entry" id="storageShoe_${storageShoeCount}">
                <div class="row">
                    <div class="col-md-6">
                        <form class="colorForm">
                            <label for="color_${storageShoeCount}" class="mb-3">Chọn Màu</label>
                            <select name="colorShoe_${storageShoeCount}" id="color_${storageShoeCount}" multiple>
                                <% listColor.forEach(function(color) { %>
                                    <option value="<%= color._id %>"><%= color.textColor %></option>
                                <% }); %>
                            </select>
                        </form>
                    </div>
                    <div class="col-md-6">
                        <form class="sizeForm">
                            <label for="size_${storageShoeCount}" class="mb-3">Chọn Size</label>
                            <select name="sizeShoe_${storageShoeCount}" id="size_${storageShoeCount}" multiple>
                                <% listSize.forEach(function(size) { %>
                                    <option value="<%= size.size %>"><%= size.sizeId %></option>
                                <% }); %>
                            </select>
                            <div class="sizeQuantity mt-3" id="sizeQuantity_${storageShoeCount}"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('storageShoeContainer').insertAdjacentHTML('beforeend', entryHtml);
        
        // Initialize arrays for this entry
        selectedSizes[storageShoeCount] = [];
        selectedColors[storageShoeCount] = [];

        // Initialize MultiSelectTag for color and size
        new MultiSelectTag(`color_${storageShoeCount}`, {
            rounded: true,
            shadow: true,
            placeholder: 'Search',
            onChange: function(values) {
                selectedColors[storageShoeCount] = values.map(v => v.value);
            }
        });

        new MultiSelectTag(`size_${storageShoeCount}`, {
            rounded: true,
            shadow: true,
            placeholder: 'Search',
            onChange: function(values) {
                selectedSizes[storageShoeCount] = values.map(v => v.value);
                updateQuantityInputs(storageShoeCount);
            }
        });
    }

    function updateQuantityInputs(entryId) {
        const quantityContainer = document.getElementById(`sizeQuantity_${entryId}`);
        quantityContainer.innerHTML = '';
        selectedSizes[entryId].forEach(size => {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `quantity_${entryId}_${size}`;
            input.name = `quantity_${entryId}_${size}`;
            input.placeholder = `Quantity for size ${size}`;
            input.className = 'form-control mt-2';
            quantityContainer.appendChild(input);
        });
    }

    document.getElementById('addStorageShoe').addEventListener('click', createStorageShoeEntry);

    // Create the first storage shoe entry when the page loads
    createStorageShoeEntry();

    document.getElementById('saveButton').addEventListener('click', async function () {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);

        // Convert FormData to a plain object for all non-file fields
        const formObject = {};
        formData.forEach((value, key) => {
            if (key !== 'thumbnail' && key !== 'imageShoe') {
                if (formObject[key]) {
                    if (Array.isArray(formObject[key])) {
                        formObject[key].push(value);
                    } else {
                        formObject[key] = [formObject[key], value];
                    }
                } else {
                    formObject[key] = value;
                }
            }
        });

        // Tạo một FormData mới để đẩy file thumbnail và imageShoe
        const fileData = new FormData();
        fileData.append('thumbnail', formData.get('thumbnail'));
        const imageShoeFiles = formData.getAll('imageShoe');
        imageShoeFiles.forEach(file => fileData.append('imageShoe', file));

        try {
            const fileUploadResponse = await fetch('/manager/uploadsFile', {
                method: 'POST',
                body: fileData
            });
            const fileUploadData = await fileUploadResponse.json();

            const storageShoeData = [];
            for (let i = 1; i <= storageShoeCount; i++) {
                const quantities = {};
                selectedSizes[i].forEach(size => {
                    const quantityInput = document.getElementById(`quantity_${i}_${size}`);
                    if (quantityInput) {
                        quantities[size] = parseInt(quantityInput.value) || 0;
                    }
                });

                storageShoeData.push({
                    colorShoe: selectedColors[i],
                    sizeShoe: selectedSizes[i].map(size => ({
                        size: size,
                        quantity: quantities[size] || 0,
                    }))
                });
            }

            const data = {
                name: formObject.name,
                importPrice: parseFloat(formObject.importPrice),
                description: formObject.description,
                typerShoeId: formObject.typerShoeId,
                thumbnail: fileUploadData.thumbnail,
                imageShoe: fileUploadData.imageShoe,
                storageShoe: storageShoeData
            };

            console.log('Payload Data:', data);

            // Gửi JSON sau khi đã có dữ liệu hình ảnh
            const productResponse = await fetch('/manager/addproduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (productResponse.ok) {
                alert('Sản phẩm đã được thêm thành công!');
            } else {
                throw new Error('Có lỗi xảy ra khi thêm sản phẩm');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm!');
        }
    });
});
