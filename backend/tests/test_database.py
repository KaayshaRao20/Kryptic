import uuid
from app.models.user import Organization, User
from app.models.payment_system import PaymentSystem
from app.models.transaction import Transaction


def test_database_organization_and_system_relationships(db_session):
    # Verify organization exists
    org = db_session.query(Organization).filter(Organization.slug == "apex-merchants").first()
    assert org is not None
    assert org.slug == "apex-merchants"

    # Create payment system with unique code
    sys_code = f"test-pay-{uuid.uuid4().hex[:6]}"
    sys = PaymentSystem(
        organization_id=org.id,
        name="Test Pay Gateway",
        code=sys_code,
        system_type="card_gateway"
    )
    db_session.add(sys)
    db_session.commit()
    db_session.refresh(sys)

    assert sys.id is not None
    assert sys.organization_id == org.id

    # Create test transaction with unique tx_id
    tx_id = f"TX_DB_TEST_{uuid.uuid4().hex[:8]}"
    tx = Transaction(
        transaction_id=tx_id,
        system_id=sys.id,
        entity_id="ent_test_01",
        amount=149.99,
        currency="USD",
        status="PROCESSED"
    )
    db_session.add(tx)
    db_session.commit()

    saved_tx = db_session.query(Transaction).filter(Transaction.transaction_id == tx_id).first()
    assert saved_tx is not None
    assert saved_tx.amount == 149.99
