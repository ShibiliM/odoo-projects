/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";
const { onMounted } = owl;
var rpc = require('web.rpc');
var array = [];

patch(ListRenderer.prototype, '/list_tree_sale_tree_preview/static/src/js/sale_tree_preview.js', {
    setup() {
        this._super();
        this.pdfViewer = null; // To track the PDF viewer container
    },

    async sale_tree_preview(ev, record) {
        var row = $(ev.target).closest('tr')[0];
        var index = array.indexOf(record.resId);
        var previewIcon = $(ev.target); // Get the clicked icon

        // Remove existing PDF viewer if any
        if (this.pdfViewer) {
            this.pdfViewer.remove();
            this.pdfViewer = null;
            $('.o_list_view .o_list_table').css('width', '30%'); // Reset table width
        }

        // Check if the record is already in preview
        if (index !== -1) {
            row.style.background = 'white';
            array.splice(index, 1); // Remove from array
//            $(ev.target).text('Open Preview'); // Change text to "Open Preview"
            previewIcon.removeClass('fa-times').addClass('fa-file-pdf-o');
//            previewIcon.removeClass('fa-caret-down').addClass('fa-caret-right');
        } else {
            array.push(record.resId);
            row.style.background = '#f0f8ff'; // Highlight previewed row
//            $(ev.target).text('Close Preview'); // Change text to "Open Preview"
            previewIcon.removeClass('fa-file-pdf-o').addClass('fa-times');
//            previewIcon.removeClass('fa-caret-right').addClass('fa-caret-down');

            // Fetch and display the PDF
            const pdfUrl = await this._fetchReportPDF(record.resId, record.resModel);
            this._displayPDF(pdfUrl);
        }

        // Save the previewed record in the database
    },

    /**
     * Fetch the PDF report URL for a given record.
     * @param {number} recordId - The ID of the record.
     * @param {string} model - The model name of the record.
     * @returns {string} - URL of the PDF report.
     */
    async _fetchReportPDF(recordId, model) {
        const reportUrl = `/report/pdf/sale.report_saleorder/${recordId}`;
        return reportUrl; // Use Odoo's standard sale order report
    },

    /**
     * Display the PDF in a container on the right side.
     * @param {string} pdfUrl - The URL of the PDF report.
     */
    _displayPDF(pdfUrl) {
        // Create PDF viewer container
        this.pdfViewer = $(`
            <div class="pdf-viewer" style="position: fixed; top: 0; right: 0; width: 40%; height: 100%; background: #fff; border-left: 1px solid #ccc; z-index: 1000;">
                <iframe src="${pdfUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
        `);
        // Append to the list view container
        $('.o_list_view').append(this.pdfViewer);
        // Adjust the list view width to accommodate the PDF viewer
        $('.o_list_view .o_list_table').css('width', '60%');
    }
});