import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ContactsTable } from "@/components/admin/contacts-table"

export default async function ContactsPage() {
    const collection = await getCollection(COLLECTIONS.CONTACTS)
    const rawContacts = await collection.find().sort({ createdAt: -1 }).toArray()

    // Serialize MongoDB objects to plain JSON for client component
    const contacts = rawContacts.map((c) => ({
        ...c,
        _id: c._id.toString(),
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    }))

    return <ContactsTable initialContacts={contacts} />
}
