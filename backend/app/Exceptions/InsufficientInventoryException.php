<?php

namespace App\Exceptions;

use Exception;

class InsufficientInventoryException extends Exception
{
    public function __construct(string $message = 'Insufficient inventory to complete this production.')
    {
        parent::__construct($message);
    }
}
