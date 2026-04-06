/*
  Warnings:

  - You are about to drop the column `user_a_id` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `user_b_id` on the `chat_conversations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticket_id]` on the table `chat_conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationKind" AS ENUM ('DIRECT', 'TICKET');

-- DropForeignKey
ALTER TABLE "chat_conversations" DROP CONSTRAINT "chat_conversations_user_a_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_conversations" DROP CONSTRAINT "chat_conversations_user_b_id_fkey";

-- AlterTable
ALTER TABLE "chat_conversations" DROP COLUMN "user_a_id",
DROP COLUMN "user_b_id",
ADD COLUMN     "kind" "ConversationKind" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "ticket_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "chat_conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "chat_conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_conversation_participants_user_id_idx" ON "chat_conversation_participants"("user_id");

-- CreateIndex
CREATE INDEX "chat_conversation_participants_conversation_id_idx" ON "chat_conversation_participants"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversation_participants_conversation_id_user_id_key" ON "chat_conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_ticket_id_key" ON "chat_conversations"("ticket_id");

-- CreateIndex
CREATE INDEX "chat_conversations_kind_idx" ON "chat_conversations"("kind");

-- CreateIndex
CREATE INDEX "chat_conversations_last_message_at_idx" ON "chat_conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_sent_at_idx" ON "chat_messages"("conversation_id", "sent_at");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation_participants" ADD CONSTRAINT "chat_conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation_participants" ADD CONSTRAINT "chat_conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
