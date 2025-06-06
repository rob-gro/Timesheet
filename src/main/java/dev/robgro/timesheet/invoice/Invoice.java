package dev.robgro.timesheet.invoice;

import dev.robgro.timesheet.client.Client;
import dev.robgro.timesheet.timesheet.Timesheet;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Client client;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> itemsList = new ArrayList<>();

    @Column(name = "issued_date")
    private LocalDateTime issuedDate;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "pdf_generated_at")
    private LocalDateTime pdfGeneratedAt;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @OneToMany(mappedBy = "invoice")
    private List<Timesheet> timesheets = new ArrayList<>();
}
