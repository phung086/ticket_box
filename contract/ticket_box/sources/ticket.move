module ticket_box::ticket {

    /// Ticket object minted when a user buys from a box
    public struct Ticket has key, store {
        id: UID,
        price: u64,
        event_id: u64,
        owner: address,
        used: bool,
    }

    /// TicketBox keeps sale configuration and supply
    public struct TicketBox has key, store {
        id: UID,
        event_id: u64,
        total: u64,
        sold: u64,
        price: u64,
    }

    const E_NO_SUPPLY: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_ALREADY_USED: u64 = 3;

    #[allow(lint(self_transfer))]
    public fun create_box(event_id: u64, total: u64, price: u64, ctx: &mut tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        let b = TicketBox {
            id: object::new(ctx),
            event_id,
            total,
            sold: 0,
            price,
        };
        transfer::public_transfer(b, sender);
    }

    #[allow(lint(self_transfer))]
    public fun buy_ticket(box: &mut TicketBox, ctx: &mut tx_context::TxContext) {
        assert!(box.sold < box.total, E_NO_SUPPLY);

        box.sold = box.sold + 1;
        let buyer = tx_context::sender(ctx);
        let t = Ticket {
            id: object::new(ctx),
            price: box.price,
            event_id: box.event_id,
            owner: buyer,
            used: false,
        };
        transfer::public_transfer(t, buyer);
    }

    public fun use_ticket(ticket: &mut Ticket, ctx: &mut tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == ticket.owner, E_NOT_OWNER);
        assert!(!ticket.used, E_ALREADY_USED);
        ticket.used = true;
    }
}
